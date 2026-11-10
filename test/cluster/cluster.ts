/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/// <reference types="node" />
import {ChildProcess, fork} from "child_process";
import * as fs from "fs";
import * as net from "net";
import * as os from "os";
import * as path from "path";
import {isDeepStrictEqual} from "util";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function waitUntil(condition: () => boolean, timeout = 5000, message = 'Condition not reached in time.') {
    const start = Date.now();
    while(!condition()) {
        if(Date.now() - start > timeout) throw new Error(message);
        await sleep(10);
    }
}

export const plain = (value: any) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
export const same = (a: any, b: any) => isDeepStrictEqual(plain(a), plain(b));

export interface ServerOptions {
    /**
     * zation-server-v0 is the release before the protocol version 1.
     */
    module?: 'zation-server' | 'zation-server-v0';
    historyLength?: number;
    /**
     * databoxHistoryBudget of the server.
     */
    historyBudget?: number;
    unregisterDelay?: number;
}

/**
 * [type, path, value]: insert, update or delete; the key $nextIndex appends to a list.
 */
export type Op = ['insert' | 'update' | 'delete', string[], any?];

/**
 * Forwards to a server; drop() cuts every connection like a lost network.
 */
export class Proxy {
    readonly port: number;
    target: number;
    private readonly server: net.Server;
    private readonly pairs = new Set<[net.Socket, net.Socket]>();

    private constructor(port: number, target: number) {
        this.port = port;
        this.target = target;
        this.server = net.createServer((client) => {
            const server = net.connect(this.target, '127.0.0.1');
            const pair: [net.Socket, net.Socket] = [client, server];
            this.pairs.add(pair);
            client.pipe(server);
            server.pipe(client);
            const end = () => {
                this.pairs.delete(pair);
                client.destroy();
                server.destroy();
            };
            client.on('close', end); server.on('close', end);
            client.on('error', end); server.on('error', end);
        });
    }

    static async start(port: number, target: number): Promise<Proxy> {
        const proxy = new Proxy(port, target);
        await new Promise<void>(resolve => proxy.server.listen(port, '127.0.0.1', () => resolve()));
        return proxy;
    }

    drop() {
        for(const [client, server] of this.pairs) {
            client.destroy();
            server.destroy();
        }
        this.pairs.clear();
    }

    close() {
        this.drop();
        this.server.close();
    }
}

/**
 * Servers in own processes (in a cluster with state server and broker or alone),
 * with a JSON file as their database.
 */
export class Cluster {
    readonly ports: Record<string, number> = {};
    readonly file: string;
    data: any;
    private readonly processes: ChildProcess[] = [];
    private readonly controls: Record<string, any> = {};
    /**
     * In a cluster: a client per server that shows every databox, to wait until all servers took a change.
     */
    private readonly watchers: Record<string, Record<string, any>> = {};
    private nextPort: number;

    private constructor(basePort: number, data: any) {
        this.nextPort = basePort;
        this.file = path.join(os.tmpdir(), `zation-resume-${process.pid}-${basePort}.json`);
        this.data = data;
        this.write();
    }

    static async start(servers: Record<string, ServerOptions>, data: any,
                       {cluster = false, basePort = 4880}: {cluster?: boolean, basePort?: number} = {}): Promise<Cluster>
    {
        const instance = new Cluster(basePort, data);
        try {
            let join: string | undefined;
            if(cluster) {
                const statePort = instance.nextPort++, brokerPort = instance.nextPort++;
                join = `resume@localhost:${statePort}`;
                await instance.fork(require.resolve('zation-state/dist/run.js'),
                    {SECRET: 'resume', PORT: String(statePort), LOG_LEVEL: '0'}, statePort);
                await instance.fork(require.resolve('zation-broker/dist/run.js'),
                    {JOIN: join, PORT: String(brokerPort), LOG_LEVEL: '0'}, brokerPort);
            }
            await Promise.all(Object.entries(servers).map(([name, options]) => instance.startServer(name, options, join)));
            if(cluster) {
                await instance.watch();
                await instance.waitLinked();
            }
            return instance;
        }
        catch (err) {
            await instance.stop();
            throw err;
        }
    }

    private async startServer(name: string, options: ServerOptions, join?: string) {
        const port = this.ports[name] = this.nextPort++;
        const env: Record<string, string> = {PORT: String(port), NAME: name, DB: this.file,
            SERVER_MODULE: options.module || 'zation-server'};
        if(join) env.JOIN = join;
        if(options.historyLength !== undefined) env.HISTORY_LENGTH = String(options.historyLength);
        if(options.historyBudget !== undefined) env.HISTORY_BUDGET = String(options.historyBudget);
        if(options.unregisterDelay !== undefined) env.UNREGISTER_DELAY = String(options.unregisterDelay);
        await this.fork(path.join(__dirname, 'server.cjs'), env, port, true);
        const {Client} = require('zation-client');
        const control = new Client({hostname: '127.0.0.1', port, path: '/zation', autoReconnect: {active: false}});
        await control.connect();
        this.controls[name] = control;
    }

    private fork(file: string, env: Record<string, string>, port: number, waitReady = false): Promise<void> {
        const child = fork(file, [], {env: {...process.env, ...env}, stdio: ['ignore', 'pipe', 'pipe', 'ipc']});
        this.processes.push(child);
        let output = '';
        child.stdout!.on('data', (chunk) => output += chunk);
        child.stderr!.on('data', (chunk) => output += chunk);
        return new Promise<void>((resolve, reject) => {
            const failed = () => reject(new Error(`${path.basename(file)} on ${port} ended: ${output}`));
            child.once('exit', failed);
            const start = Date.now();
            const check = async () => {
                if(waitReady ? output.includes('ready') : await isListening(port)) {
                    child.off('exit', failed);
                    resolve();
                }
                else if(Date.now() - start > 20000) failed();
                else setTimeout(check, 50);
            };
            check();
        });
    }

    private async watch() {
        const {Client} = require('zation-client');
        for(const name in this.ports) {
            const client = new Client({hostname: '127.0.0.1', port: this.ports[name], path: '/zation', autoReconnect: {active: false}});
            await client.connect();
            const databoxes: Record<string, any> = {};
            for(const key of ['box', 'syncBox', 'filtered']) await (databoxes[key] = client.databox(key)).connect();
            for(const member in this.data.rooms) await (databoxes['rooms.' + member] = client.databox('room')).connect(member);
            this.watchers[name] = databoxes;
            this.processes.push({kill: () => client.disconnect()} as any);
        }
    }

    /**
     * Until the servers get the transactions of each other.
     */
    private async waitLinked() {
        const start = Date.now();
        for(const name in this.ports) {
            for(let linked = false; !linked;) {
                if(Date.now() - start > 20000) throw new Error('The servers did not link.');
                try {
                    await this.change(name, 'box', [['update', ['level'], this.data.box.level + 1]], undefined, 300);
                    linked = true;
                }
                catch (_) {}
            }
        }
    }

    /**
     * Until every server shows the database (in a cluster): the servers take changes in the same order.
     */
    async settled(box: string, member?: string, timeout = 5000) {
        const key = member !== undefined ? 'rooms.' + member : box;
        await waitUntil(() => Object.values(this.watchers).every(databoxes => same(databoxes[key].data, this.target(box, member))),
            timeout, `A server did not take the change of ${key}.`);
    }

    write() {
        fs.writeFileSync(this.file, JSON.stringify(this.data));
    }

    private target(box: string, member?: string) {
        return member !== undefined ? this.data.rooms[member] : this.data[box];
    }

    /**
     * Writes the change to the database first, then lets the server emit it.
     */
    async change(server: string, box: string, ops: Op[], member?: string, timeout?: number) {
        const value = this.target(box, member);
        for(const op of ops) applyOp(value, op);
        this.write();
        await this.controls[server].request('emit', {box, member, ops});
        await this.settled(box, member, timeout);
    }

    async sync(server: string, box: string, value: any) {
        this.data[box] = value;
        this.write();
        await this.controls[server].request('emit', {box, sync: value});
        await this.settled(box);
    }

    async emit(server: string, payload: any) {
        await this.controls[server].request('emit', payload);
        await this.settled(payload.box, payload.member);
    }

    async control(server: string, input: any = {}): Promise<{fetches: number, name: string}> {
        return this.controls[server].request('control', input);
    }

    async stop() {
        for(const name in this.controls) this.controls[name].disconnect();
        for(const child of this.processes) child.kill();
        await sleep(50);
        try {fs.unlinkSync(this.file);}
        catch (_) {}
    }
}

export function applyOp(value: any, [type, opPath, opValue]: Op) {
    let target = value;
    for(let i = 0; i < opPath.length - 1; i++) target = target[opPath[i]];
    const key = opPath[opPath.length - 1];
    if(type === 'delete') {
        if(Array.isArray(target)) target.splice(Number(key), 1);
        else delete target[key];
    }
    else if(key === '$nextIndex') target.push(opValue);
    else target[key] = opValue;
}

function isListening(port: number): Promise<boolean> {
    return new Promise(resolve => {
        const socket = net.connect(port, '127.0.0.1');
        socket.once('connect', () => {socket.destroy(); resolve(true);});
        socket.once('error', () => resolve(false));
    });
}

/**
 * The connect responses (and fetch answers) a client gets, to see which way a databox took.
 */
export function watchResponses(client: any): {connects: any[], fetches: number, clear: () => void} {
    const watched = {connects: [] as any[], fetches: 0, clear: () => {watched.connects = []; watched.fetches = 0;}};
    const transport = client.socket._transport;
    const emit = transport.emitMessage.bind(transport);
    const take = (packet: any) => {
        //[3 (data response), call id, data type, data]
        const data = packet[0] === 3 ? packet[3] : undefined;
        if(data === null || typeof data !== 'object') return;
        if(typeof data.i === 'string' && data.i.startsWith('D>')) watched.connects.push(data);
        else if(typeof data.c === 'number' && 'ti' in data) watched.fetches++;
    };
    transport.emitMessage = (message: any) => {
        if(typeof message === 'string') {
            try {
                const packet = JSON.parse('[' + message + ']');
                //a bundle: [0, packets]
                if(packet[0] === 0) packet[1].forEach(take);
                else take(packet);
            }
            catch (_) {}
        }
        return emit(message);
    };
    return watched;
}
