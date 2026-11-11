/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/// <reference types="node" />
import {ChildProcess, fork} from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as assert from "assert";
import {Client} from "zation-client";
import {sleep, waitUntil} from "../cluster/cluster";

/*
The auto reconnect of the client (zation-client 3.0.0-beta.5, ziron-client 9.13.0) in Node.js,
without document and window, against servers in own processes that restart.
*/
describe('Auto reconnect tests', function () {
    this.timeout(30000);

    const PORT = 5800;
    const DB = path.join(os.tmpdir(), `zation-reconnect-${process.pid}.json`);
    let server: ChildProcess | undefined;
    const clients: Client[] = [];

    function startServer(): Promise<ChildProcess> {
        const child = fork(path.join(__dirname, '..', 'cluster', 'server.cjs'), [],
            {env: {...process.env, PORT: String(PORT), NAME: 'R', DB}, stdio: ['ignore', 'pipe', 'pipe', 'ipc']});
        let output = '';
        child.stdout!.on('data', (chunk) => output += chunk);
        child.stderr!.on('data', (chunk) => output += chunk);
        return new Promise((resolve, reject) => {
            const failed = () => reject(new Error(`The server ended: ${output}`));
            child.once('exit', failed);
            const check = () => {
                if(output.includes('ready')) {
                    child.off('exit', failed);
                    resolve(child);
                }
                else setTimeout(check, 20);
            };
            check();
        });
    }

    async function stopServer(signal: NodeJS.Signals) {
        const child = server;
        server = undefined;
        if(!child || child.exitCode !== null) return;
        await new Promise(resolve => {
            child.once('exit', resolve);
            child.kill(signal);
        });
    }

    function createClient(autoReconnect: any): Client {
        const client = new Client({hostname: '127.0.0.1', port: PORT, path: '/zation', autoReconnect});
        clients.push(client);
        return client;
    }

    before(() => {
        assert.strictEqual(typeof (globalThis as any).document, 'undefined', 'The tests run without a DOM.');
        fs.writeFileSync(DB, '{}');
    });
    beforeEach(async () => {server = await startServer();});
    afterEach(async () => {
        while(clients.length) clients.pop()!.disconnect();
        await stopServer('SIGKILL');
    });
    after(() => {
        try {fs.unlinkSync(DB);}
        catch (_) {}
    });

    it('Should reconnect after a restart of zation-server, which closes with 1001, also without afterNormalClose.', async () => {
        const client = createClient({delays: [300]});
        await client.connect();
        const disconnect = client.onceDisconnect(10000);
        await stopServer('SIGTERM');
        const [code, , permanent] = await disconnect;
        assert.strictEqual(code, 1001);
        assert.strictEqual(permanent, false);
        server = await startServer();
        await waitUntil(() => client.connected, 10000);
        assert.strictEqual(await client.request('control').then((res: any) => res.name), 'R');
    });

    it('Should reconnect after a server that closes normally (1000) restarted, with afterNormalClose.', async () => {
        const client = createClient({delays: [300], afterNormalClose: true});
        await client.connect();
        const disconnect = client.onceDisconnect(5000);
        await client.request('goodbye');
        const [code, , permanent] = await disconnect;
        assert.strictEqual(code, 1000);
        assert.strictEqual(permanent, false);
        assert.ok(client.nextReconnectAt !== null);
        await waitUntil(() => server!.exitCode !== null, 5000);
        server = await startServer();
        await waitUntil(() => client.connected, 10000);
    });

    it('Should stay disconnected after a normal close (1000) of the server without afterNormalClose.', async () => {
        const client = createClient({delays: [300]});
        await client.connect();
        const disconnect = client.onceDisconnect(5000);
        await client.request('goodbye');
        const [code, , permanent] = await disconnect;
        assert.strictEqual(code, 1000);
        assert.strictEqual(permanent, true);
        assert.strictEqual(client.nextReconnectAt, null);
        await waitUntil(() => server!.exitCode !== null, 5000);
        server = await startServer();
        await sleep(1500);
        assert.strictEqual(client.connected, false);
        client.reconnectNow();
        await sleep(300);
        assert.strictEqual(client.connected, false);
        //connect comes back by hand
        await client.connect();
        assert.strictEqual(client.connected, true);
    });

    it('Should tell the planned reconnect and bring it forward with reconnectNow (no events of a browser).', async () => {
        const client = createClient({delays: [60000]});
        await client.connect();
        const planned = client.onceNextReconnectChange(5000);
        await stopServer('SIGKILL');
        const [at] = await planned;
        assert.ok(at !== null && at - Date.now() > 50000, `Planned at ${at}.`);
        server = await startServer();
        await sleep(300);
        assert.strictEqual(client.connected, false);
        const start = Date.now();
        client.reconnectNow();
        await waitUntil(() => client.connected, 5000);
        assert.ok(Date.now() - start < 5000);
        assert.strictEqual(client.nextReconnectAt, null);
    });

    it('Should take the delays one after another while the server is away and not try after disconnect.', async () => {
        const client = createClient({delays: [100, 200, 400]});
        await client.connect();
        const plans: number[] = [];
        client.onNextReconnectChange(at => {if(at !== null) plans.push(at - Date.now());});
        await stopServer('SIGKILL');
        await waitUntil(() => plans.length >= 4, 10000);
        for(const [i, expected] of [100, 200, 400, 400].entries())
            assert.ok(Math.abs(plans[i] - expected) <= 20, `Delay ${i}: ${plans[i]} ms instead of ${expected} ms.`);
        client.disconnect();
        assert.strictEqual(client.nextReconnectAt, null);
        server = await startServer();
        await sleep(800);
        assert.strictEqual(client.connected, false);
        assert.strictEqual(plans.length, 4);
    });
});
