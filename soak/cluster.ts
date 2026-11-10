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

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
export const plain = (value: any) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
export const same = (a: any, b: any) => isDeepStrictEqual(plain(a), plain(b));

export async function waitUntil(condition: () => boolean | Promise<boolean>, timeout = 5000, message = 'Condition not reached in time.') {
    const start = Date.now();
    while(!(await condition())) {
        if(Date.now() - start > timeout) throw new Error(message);
        await sleep(20);
    }
}

/**
 * A TCP link to a target port with faults: cut it, lose what is in flight, delay it or keep it down.
 */
export class Link {
    private readonly server: net.Server;
    private readonly pairs = new Set<[net.Socket, net.Socket]>();
    private frozen = false;
    private down = false;
    private latency = 0;

    private constructor(readonly port: number, public target: number) {
        this.server = net.createServer((client) => {
            if(this.down) return client.destroy();
            const upstream = net.connect(this.target, '127.0.0.1');
            const pair: [net.Socket, net.Socket] = [client, upstream];
            this.pairs.add(pair);
            this.pipe(client, upstream);
            this.pipe(upstream, client);
            const end = () => {
                this.pairs.delete(pair);
                client.destroy();
                upstream.destroy();
            };
            client.on('close', end); upstream.on('close', end);
            client.on('error', end); upstream.on('error', end);
        });
    }

    /**
     * Keeps the order of the chunks when the latency changes.
     */
    private pipe(from: net.Socket, to: net.Socket) {
        const queue: [number, Buffer][] = [];
        let timer: NodeJS.Timeout | undefined;
        const drain = () => {
            timer = undefined;
            const now = Date.now();
            while(queue.length > 0 && queue[0][0] <= now) to.write(queue.shift()![1]);
            if(queue.length > 0) timer = setTimeout(drain, queue[0][0] - now);
        };
        from.on('data', (chunk: Buffer) => {
            if(this.frozen) return;
            if(this.latency <= 0 && queue.length === 0) return to.write(chunk);
            queue.push([Date.now() + this.latency, chunk]);
            if(timer === undefined) timer = setTimeout(drain, this.latency);
        });
        from.on('close', () => {if(timer !== undefined) clearTimeout(timer);});
    }

    static async start(port: number, target: number): Promise<Link> {
        const link = new Link(port, target);
        await new Promise<void>((resolve, reject) => {
            link.server.once('error', reject);
            link.server.listen(port, '127.0.0.1', () => resolve());
        });
        return link;
    }

    drop() {
        for(const [client, upstream] of this.pairs) {
            client.destroy();
            upstream.destroy();
        }
        this.pairs.clear();
    }

    /**
     * What is sent until the connection breaks is lost (like a network that broke without notice).
     */
    async cut(ms: number) {
        this.frozen = true;
        await sleep(ms);
        this.drop();
        this.frozen = false;
    }

    delay(ms: number) {
        this.latency = ms;
    }

    setDown(down: boolean) {
        this.down = down;
        if(down) this.drop();
    }

    heal() {
        this.latency = 0;
        this.down = false;
        if(this.frozen) {
            this.frozen = false;
            this.drop();
        }
    }

    close() {
        this.drop();
        this.server.close();
    }
}

/** Children still running when the run ends (also by an error) are killed. */
const children = new Set<ChildProcess>();
process.on('exit', () => {for(const child of children) child.kill('SIGKILL');});

class Proc {
    child: ChildProcess | undefined;
    output = '';

    constructor(readonly file: string, readonly env: Record<string, string>, readonly port: number,
                private readonly waitReady: boolean) {}

    get running() {return this.child !== undefined;}

    start(): Promise<void> {
        const child = fork(this.file, [], {env: {...process.env, ...this.env}, stdio: ['ignore', 'pipe', 'pipe', 'ipc']});
        this.child = child;
        children.add(child);
        this.output = '';
        child.stdout!.on('data', (chunk) => this.output = (this.output + chunk).slice(-4000));
        child.stderr!.on('data', (chunk) => this.output = (this.output + chunk).slice(-4000));
        child.once('exit', () => {
            children.delete(child);
            if(this.child === child) this.child = undefined;
        });
        return new Promise<void>((resolve, reject) => {
            const failed = () => reject(new Error(`${path.basename(this.file)} on ${this.port} ended: ${this.output}`));
            child.once('exit', failed);
            const start = Date.now();
            const check = async () => {
                if(this.waitReady ? this.output.includes('ready') : await isListening(this.port)) {
                    child.off('exit', failed);
                    resolve();
                }
                else if(Date.now() - start > 30000) failed();
                else setTimeout(check, 30);
            };
            check();
        });
    }

    async kill() {
        const child = this.child;
        if(!child) return;
        this.child = undefined;
        await new Promise<void>(resolve => {
            child.once('exit', () => resolve());
            child.kill('SIGKILL');
        });
    }

    private queue: Promise<void> = Promise.resolve();

    /**
     * One after the other: a restart does not kill a starting process.
     */
    restart(pause = 0): Promise<void> {
        return this.queue = this.queue.catch(() => {}).then(async () => {
            await this.kill();
            if(pause > 0) await sleep(pause);
            await this.start();
        });
    }

    async ensure() {
        await this.queue.catch(() => {});
        if(!this.running) await this.start();
    }
}

function isListening(port: number): Promise<boolean> {
    return new Promise(resolve => {
        const socket = net.connect(port, '127.0.0.1');
        socket.once('connect', () => {socket.destroy(); resolve(true);});
        socket.once('error', () => resolve(false));
    });
}

export interface SoakOptions {
    servers?: string[],
    brokers?: number,
    basePort?: number,
    historyLength?: number,
    /**
     * databoxHistoryBudget of the servers.
     */
    historyBudget?: number,
    /**
     * zation-client by default.
     */
    clientModule?: string,
    /**
     * Clock skew in ms per server.
     */
    skew?: Record<string, number>,
}

/**
 * The source of the data: the run writes a change here first, then lets a server emit it.
 */
export interface Db {
    items: Record<string, Record<string, any>>,
    synced: Record<string, any>,
    board: Record<string, any>,
    probe: Record<string, any>
}

/**
 * State server, brokers and servers in own processes.
 * Every server reaches every broker over its own link, every client its server over its own link.
 */
export class SoakCluster {
    readonly servers: string[];
    readonly db: Db = {items: {}, synced: {}, board: {}, probe: {}};
    readonly file: string;
    readonly serverProcs: Record<string, Proc> = {};
    readonly serverPorts: Record<string, number> = {};
    readonly brokerProcs: Proc[] = [];
    readonly links: Record<string, Link[]> = {};
    readonly clients: SoakClient[] = [];
    /**
     * How far the fastest clock of a server runs ahead: timestamps of the run follow it.
     */
    readonly clockLead: number;
    private stateProc: Proc;
    private readonly controls: Record<string, any> = {};
    private readonly probes: Record<string, any> = {};
    private nextPort: number;
    private probeCounter = 0;

    private constructor(private readonly options: SoakOptions) {
        this.servers = options.servers || ['A', 'B', 'C'];
        this.clockLead = Math.max(0, ...Object.values(options.skew || {}));
        this.nextPort = options.basePort || 5100;
        this.file = path.join(os.tmpdir(), `zation-soak-${process.pid}-${this.nextPort}.json`);
        this.write();
    }

    static async start(options: SoakOptions = {}): Promise<SoakCluster> {
        const cluster = new SoakCluster(options);
        try {
            await cluster.launch();
            return cluster;
        }
        catch (err) {
            await cluster.stop();
            throw err;
        }
    }

    private async launch() {
        const statePort = this.nextPort++;
        const join = `soak@127.0.0.1:${statePort}`;
        this.stateProc = new Proc(require.resolve('zation-state/dist/run.js'),
            {SECRET: 'soak', PORT: String(statePort), LOG_LEVEL: '0'}, statePort, false);
        await this.stateProc.start();
        const brokerPorts: number[] = [];
        for(let i = 0; i < (this.options.brokers || 1); i++) {
            const port = this.nextPort++;
            brokerPorts.push(port);
            this.brokerProcs.push(new Proc(require.resolve('zation-broker/dist/run.js'),
                {JOIN: join, PORT: String(port), LOG_LEVEL: '0'}, port, false));
        }
        await Promise.all(this.brokerProcs.map(proc => proc.start()));
        for(const name of this.servers) {
            const port = this.serverPorts[name] = this.nextPort++;
            const proxies: Record<string, number> = {};
            this.links[name] = [];
            for(const brokerPort of brokerPorts) {
                const link = await Link.start(this.nextPort++, brokerPort);
                this.links[name].push(link);
                proxies[String(brokerPort)] = link.port;
            }
            const env: Record<string, string> = {PORT: String(port), NAME: name, DB: this.file, JOIN: join,
                BROKER_PROXIES: JSON.stringify(proxies)};
            if(this.options.historyLength !== undefined) env.HISTORY_LENGTH = String(this.options.historyLength);
            if(this.options.historyBudget !== undefined) env.HISTORY_BUDGET = String(this.options.historyBudget);
            if(this.options.skew?.[name]) env.CLOCK_SKEW_MS = String(this.options.skew[name]);
            this.serverProcs[name] = new Proc(path.join(__dirname, 'server.cjs'), env, port, true);
        }
        await Promise.all(this.servers.map(name => this.serverProcs[name].start()));
        for(const name of this.servers) {
            const control = this.newClient(this.serverPorts[name]);
            await control.connect();
            this.controls[name] = control;
            const probe = control.databox('probe');
            await probe.connect();
            this.probes[name] = probe;
        }
        await this.waitLinked(30000);
    }

    newClient(port: number): any {
        const {Client} = require(this.options.clientModule || 'zation-client');
        return new Client({hostname: '127.0.0.1', port, path: '/zation',
            autoReconnect: {active: true, initialDelay: 50, randomness: 150, multiplier: 1, maxDelay: 300}});
    }

    write() {
        fs.writeFileSync(this.file, JSON.stringify(this.db));
    }

    up(server: string): boolean {
        return this.serverProcs[server].running;
    }

    /**
     * Lets a server emit a change (after the run wrote it).
     */
    async emit(server: string, payload: any): Promise<void> {
        await this.controls[server].request('emit', payload);
    }

    async control(server: string, input: any): Promise<void> {
        await this.controls[server].request('control', input);
    }

    /**
     * Until a change of each server reaches every server (for the probe channel).
     */
    async waitLinked(timeout = 20000) {
        const start = Date.now();
        for(const name of this.servers) {
            for(;;) {
                const key = name, value = ++this.probeCounter;
                this.db.probe[key] = value;
                this.write();
                try {
                    await this.emit(name, {box: 'probe', ops: [['set', key, value]], timestamp: Date.now() + this.clockLead});
                    await waitUntil(() => this.servers.every(other => same(this.probes[other].data, this.db.probe)), 400);
                    break;
                }
                catch (_) {
                    if(Date.now() - start > timeout) throw new Error(`The server ${name} did not link: ` +
                        JSON.stringify(this.servers.map(other => plain(this.probes[other].data))));
                    await sleep(100);
                }
            }
        }
    }

    async restartBroker(index: number, pause: number) {
        await this.brokerProcs[index].restart(pause);
    }

    async restartServer(name: string, pause: number) {
        await this.serverProcs[name].restart(pause);
        await waitUntil(() => this.controls[name].connected, 10000, `The control of ${name} did not reconnect.`);
    }

    async addClient(server: string): Promise<SoakClient> {
        const link = await Link.start(this.nextPort++, this.serverPorts[server]);
        const client = new SoakClient(this, link, server);
        await client.instance.connect();
        this.clients.push(client);
        return client;
    }

    /**
     * Ends all faults; waits until every process runs.
     */
    async heal() {
        for(const name of this.servers) for(const link of this.links[name]) link.heal();
        for(const client of this.clients) client.link.heal();
        for(const proc of [...this.brokerProcs, ...this.servers.map(name => this.serverProcs[name])]) await proc.ensure();
        for(const name of this.servers) await this.control(name, {fetchDelay: 0}).catch(() => {});
    }

    async stop() {
        for(const client of this.clients) client.close();
        for(const name in this.controls) this.controls[name].disconnect();
        for(const name in this.links) for(const link of this.links[name]) link.close();
        await Promise.all([...Object.values(this.serverProcs), ...this.brokerProcs].map(proc => proc.kill()));
        if(this.stateProc) await this.stateProc.kill();
        try {fs.unlinkSync(this.file);}
        catch (_) {}
    }
}

/**
 * A client with its databoxes, connected to a server over its own link.
 */
export class SoakClient {
    readonly instance: any;
    readonly databoxes: Record<string, any> = {};

    constructor(private readonly cluster: SoakCluster, readonly link: Link, public server: string) {
        this.instance = cluster.newClient(link.port);
    }

    async open(key: string, identifier: string, member?: string) {
        const databox = this.instance.databox(identifier);
        this.databoxes[key] = databox;
        await databox.connect(member);
    }

    async closeDatabox(key: string) {
        const databox = this.databoxes[key];
        delete this.databoxes[key];
        if(databox) await databox.disconnect().catch(() => {});
    }

    /**
     * Cuts the connection; the client connects again (to another server when given).
     */
    drop(to?: string) {
        if(to !== undefined) {
            this.server = to;
            this.link.target = this.cluster.serverPorts[to];
        }
        this.link.drop();
    }

    close() {
        this.instance.disconnect();
        this.link.close();
    }
}
