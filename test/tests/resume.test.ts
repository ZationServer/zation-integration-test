/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import * as assert from "assert";
/// <reference types="node" />
import {Cluster, Op, plain, Proxy, same, sleep, waitUntil, watchResponses} from "../cluster/cluster";

/* Connect responses of protocol version 1 */
const UNCHANGED = 0, TRANSACTIONS = 1, DATA = 2;

const START = () => ({
    box: {name: 'start', level: 1, list: []},
    syncBox: {mode: 'film', volume: {level: 40}, sources: ['hdmi1']},
    filtered: {level: 1},
    rooms: {a: {topic: 'a', count: 0}, b: {topic: 'b', count: 0}}
});

let proxyPort = 4950;

async function client(cluster: Cluster, server: string, {old = false} = {}) {
    const proxy = await Proxy.start(proxyPort++, cluster.ports[server]);
    const {Client} = require(old ? 'zation-client-v0' : 'zation-client');
    const instance = new Client({hostname: '127.0.0.1', port: proxy.port, path: '/zation', autoReconnect: {active: false}});
    await instance.connect();
    const responses = watchResponses(instance);
    return {
        proxy, instance, responses,
        /** Drops the connection (like a lost network) and connects again, optionally to another server. */
        async away(during?: () => Promise<void>, to?: string) {
            proxy.drop();
            await waitUntil(() => !instance.connected, 5000, 'The client did not notice the lost connection.');
            if(during) await during();
            if(to !== undefined) proxy.target = cluster.ports[to];
            responses.clear();
            await instance.connect();
        },
        close() {
            instance.disconnect();
            proxy.close();
        }
    };
}

const lastConnect = (responses: {connects: any[]}) => responses.connects[responses.connects.length - 1];

async function shows(databox: any, expected: () => any, timeout = 5000) {
    await waitUntil(() => same(databox.data, expected()), timeout,
        `Expected ${JSON.stringify(expected())}, shows ${JSON.stringify(plain(databox.data))}`);
}

describe('Resume tests (protocol version 1)', function () {
    this.timeout(60000);

    describe('One server', () => {
        let cluster: Cluster;
        before(async () => {cluster = await Cluster.start({A: {}}, START(), {basePort: 4880});});
        after(async () => cluster?.stop());

        it('Should send the first data with the connect response.', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();
            assert.ok(same(box.data, cluster.data.box));
            assert.strictEqual(lastConnect(c.responses).r, DATA);
            assert.strictEqual(c.responses.fetches, 0);
            c.close();
        });

        it('Should resume unchanged, with the missed transactions or with the data.', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();

            await c.away();
            await waitUntil(() => box.isConnected());
            assert.strictEqual(lastConnect(c.responses).r, UNCHANGED);

            await c.away(async () => {
                await cluster.change('A', 'box', [['update', ['level'], 2]]);
                await cluster.change('A', 'box', [['insert', ['list', '$nextIndex'], 'x'], ['insert', ['extra'], true]]);
            });
            await shows(box, () => cluster.data.box);
            assert.strictEqual(lastConnect(c.responses).r, TRANSACTIONS);
            assert.strictEqual(lastConnect(c.responses).tx.length, 2);
            assert.strictEqual(c.responses.fetches, 0);

            //live changes go on
            await cluster.change('A', 'box', [['insert', ['list', '$nextIndex'], 'y']]);
            await shows(box, () => cluster.data.box);
            c.close();
        });

        it('Should resume a member of a Databox family.', async () => {
            const c = await client(cluster, 'A');
            const room = c.instance.databox('room');
            await room.connect('a');
            await c.away(() => cluster.change('A', 'room', [['update', ['count'], 1]], 'a'));
            await shows(room, () => cluster.data.rooms.a);
            assert.strictEqual(lastConnect(c.responses).r, TRANSACTIONS);
            c.close();
        });

        it('Should send the data when a forced reload came in between.', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();
            await c.away(async () => {
                cluster.data.box.level = 50;
                cluster.write();
                await cluster.emit('A', {box: 'box', reload: true});
            });
            await shows(box, () => cluster.data.box);
            assert.strictEqual(lastConnect(c.responses).r, DATA);
            c.close();
        });

        it('Should reload after a change of unknown content that came in between.', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();
            await c.away(async () => {
                cluster.data.box.level = 51;
                cluster.write();
                await cluster.emit('A', {box: 'box', unknown: true});
            });
            await shows(box, () => cluster.data.box);
            c.close();
        });

        it('Should not replay missed transactions through a transaction middleware.', async () => {
            const c = await client(cluster, 'A');
            const filtered = c.instance.databox('filtered');
            await filtered.connect();
            await c.away(() => cluster.change('A', 'filtered', [['update', ['level'], 2]]));
            await shows(filtered, () => cluster.data.filtered);
            assert.strictEqual(lastConnect(c.responses).r, DATA);
            await c.away();
            await waitUntil(() => filtered.isConnected());
            assert.strictEqual(lastConnect(c.responses).r, UNCHANGED);
            c.close();
        });

        it('Should apply changes during the fetch of the connect once (data from before the registration).', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();
            //the history does not reach back, so the server fetches; meanwhile, the list grows
            await c.away(async () => {
                for(let i = 0; i < 3; i++) await cluster.change('A', 'box', [['insert', ['list', '$nextIndex'], 'away' + i]]);
                await cluster.control('A', {fetchDelay: 300});
            });
            await sleep(100);
            for(let i = 0; i < 3; i++) await cluster.change('A', 'box', [['insert', ['list', '$nextIndex'], 'during' + i]]);
            await cluster.control('A', {fetchDelay: 0});
            await shows(box, () => cluster.data.box);
            const response = lastConnect(c.responses);
            assert.strictEqual(response.r, TRANSACTIONS);
            c.close();

            //a new client fetches on connect: the changes during the fetch come as transactions after the data
            const fresh = await client(cluster, 'A');
            await cluster.control('A', {fetchDelay: 300});
            const freshBox = fresh.instance.databox('box');
            const connected = freshBox.connect();
            await sleep(100);
            for(let i = 0; i < 3; i++) await cluster.change('A', 'box', [['insert', ['list', '$nextIndex'], 'fresh' + i]]);
            await connected;
            await cluster.control('A', {fetchDelay: 0});
            await shows(freshBox, () => cluster.data.box);
            const first = lastConnect(fresh.responses);
            assert.strictEqual(first.r, DATA);
            assert.strictEqual(first.tx.length, 3);
            //no duplicates later on
            await cluster.change('A', 'box', [['insert', ['list', '$nextIndex'], 'after']]);
            await shows(freshBox, () => cluster.data.box);
            fresh.close();
        });

        it('Should resume content().sync transactions without a reload.', async () => {
            const c = await client(cluster, 'A');
            await cluster.sync('A', 'syncBox', cluster.data.syncBox);
            const syncBox = c.instance.databox('syncBox');
            await syncBox.connect();
            await cluster.sync('A', 'syncBox', {...cluster.data.syncBox, mode: 'tv'});
            await shows(syncBox, () => cluster.data.syncBox);

            await c.away(async () => {
                await cluster.sync('A', 'syncBox', {...cluster.data.syncBox, volume: {level: 41}});
                await cluster.sync('A', 'syncBox', {...cluster.data.syncBox, sources: ['hdmi1', 'hdmi2']});
            });
            await shows(syncBox, () => cluster.data.syncBox);
            assert.strictEqual(lastConnect(c.responses).r, TRANSACTIONS);
            await sleep(50);
            assert.strictEqual(c.responses.fetches, 0);
            await cluster.sync('A', 'syncBox', {...cluster.data.syncBox, mode: 'radio'});
            await shows(syncBox, () => cluster.data.syncBox);
            assert.strictEqual(c.responses.fetches, 0);
            c.close();
        });

        it('Should load the data when the history expired.', async () => {
            const short = await Cluster.start({S: {historyLength: 2, unregisterDelay: 200}}, START(), {basePort: 4890});
            try {
                const c = await client(short, 'S');
                const box = c.instance.databox('box');
                await box.connect();
                await c.away(async () => {
                    for(let i = 0; i < 3; i++) await short.change('S', 'box', [['update', ['level'], 10 + i]]);
                });
                await shows(box, () => short.data.box);
                assert.strictEqual(lastConnect(c.responses).r, DATA);

                //away longer than the unregister delay: the databox registers again with a new history
                const before = lastConnect(c.responses).h;
                await c.away(async () => {
                    await sleep(400);
                    await short.change('S', 'box', [['update', ['level'], 20]]);
                });
                await shows(box, () => short.data.box);
                assert.notStrictEqual(lastConnect(c.responses).h, before);
                assert.strictEqual(lastConnect(c.responses).r, DATA);
                c.close();
            }
            finally {await short.stop();}
        });
    });

    describe('Cluster with broker', () => {
        let cluster: Cluster;
        before(async () => {cluster = await Cluster.start({A: {}, B: {}}, START(), {cluster: true, basePort: 4900});});
        after(async () => cluster?.stop());

        it('Should resume with transactions that came from another server.', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();
            await c.away(async () => {
                await cluster.change('B', 'box', [['update', ['level'], 100]]);
                await cluster.change('A', 'box', [['insert', ['list', '$nextIndex'], 'a']]);
                await cluster.change('B', 'box', [['insert', ['list', '$nextIndex'], 'b']]);
                await sleep(100);
            });
            await shows(box, () => cluster.data.box);
            assert.strictEqual(lastConnect(c.responses).r, TRANSACTIONS);
            c.close();
        });

        it('Should take the data when the client comes back on another server, and nothing when nothing changed.', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();
            //B follows the databox, so it knows the last transaction
            const watcher = await client(cluster, 'B');
            await watcher.instance.databox('box').connect();

            await c.away(undefined, 'B');
            await waitUntil(() => box.isConnected());
            assert.strictEqual(lastConnect(c.responses).r, UNCHANGED);

            await c.away(() => cluster.change('A', 'box', [['update', ['level'], 101]]), 'A');
            await shows(box, () => cluster.data.box);
            assert.strictEqual(lastConnect(c.responses).r, DATA);

            await c.away(async () => {
                await cluster.change('B', 'box', [['update', ['level'], 102]]);
                await sleep(100);
            }, 'B');
            await shows(box, () => cluster.data.box);
            assert.notStrictEqual(lastConnect(c.responses).r, undefined);
            watcher.close();
            c.close();
        });

        it('Should take the data on another server when a forced reload came in between.', async () => {
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            await box.connect();
            await c.away(async () => {
                cluster.data.box.level = 103;
                cluster.write();
                await cluster.emit('A', {box: 'box', reload: true});
            }, 'B');
            await shows(box, () => cluster.data.box);
            assert.strictEqual(lastConnect(c.responses).r, DATA);
            c.close();
        });
    });

    describe('Old and new versions', () => {
        let cluster: Cluster;
        before(async () => {
            cluster = await Cluster.start({N: {}, O: {module: 'zation-server-v0'}}, START(), {cluster: true, basePort: 4920});
        });
        after(async () => cluster?.stop());

        const scenario = async (server: string, old: boolean) => {
            const c = await client(cluster, server, {old});
            const box = c.instance.databox('box');
            await box.connect();
            assert.ok(same(box.data, cluster.data.box));
            await c.away(() => cluster.change(server, 'box', [['insert', ['list', '$nextIndex'], `${server}${old}`]]));
            await shows(box, () => cluster.data.box);
            await c.away();
            await cluster.change(server, 'box', [['update', ['level'], Date.now()]]);
            await shows(box, () => cluster.data.box);
            const response = lastConnect(c.responses);
            c.close();
            return response;
        };

        it('Should use the old protocol with an old client on a new server.', async () => {
            const response = await scenario('N', true);
            assert.strictEqual(response.v, undefined);
        });

        it('Should fall back to the old protocol with a new client on an old server.', async () => {
            const response = await scenario('O', false);
            assert.strictEqual(response.v, undefined);
        });

        it('Should keep the data right when a new client moves between an old and a new server.', async () => {
            const c = await client(cluster, 'N');
            const box = c.instance.databox('box');
            await box.connect();
            for(const [to, from] of [['O', 'N'], ['N', 'O'], ['O', 'N'], ['N', 'O']]) {
                await c.away(async () => {
                    await cluster.change(from, 'box', [['insert', ['list', '$nextIndex'], `${from}>${to}`]]);
                    await sleep(100);
                }, to);
                await shows(box, () => cluster.data.box);
                await cluster.change(to, 'box', [['insert', ['list', '$nextIndex'], `on ${to}`]]);
                await shows(box, () => cluster.data.box);
            }
            c.close();
        });
    });

    describe('Fuzz', () => {
        let cluster: Cluster;
        before(async () => {
            cluster = await Cluster.start({A: {historyLength: 8}, B: {historyLength: 8}}, START(), {cluster: true, basePort: 4940});
        });
        after(async () => cluster?.stop());

        /** A small seeded random generator (mulberry32), so a failing run can be repeated. */
        function random(seed: number) {
            return () => {
                seed |= 0; seed = seed + 0x6D2B79F5 | 0;
                let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        it('Should end with the data of the database for random changes, losses and server switches.', async () => {
            const rnd = random(Number(process.env.RESUME_SEED || 7));
            const pick = <T>(list: T[]): T => list[Math.floor(rnd() * list.length)];
            const servers = ['A', 'B'];
            const c = await client(cluster, 'A');
            const box = c.instance.databox('box');
            const syncBox = c.instance.databox('syncBox');
            const room = c.instance.databox('room');
            await Promise.all([box.connect(), syncBox.connect(), room.connect('b')]);
            const results: Record<string, number> = {};
            let counter = 0;
            const trace: string[] = [];

            const change = async () => {
                const server = pick(servers);
                const kind = rnd();
                if(kind < 0.4) {
                    const ops: Op[] = [];
                    for(let i = 0, len = 1 + Math.floor(rnd() * 3); i < len; i++) {
                        const which = rnd();
                        if(which < 0.4) ops.push(['insert', ['list', '$nextIndex'], ++counter]);
                        else if(which < 0.6 && cluster.data.box.list.length > 0) ops.push(['delete', ['list', String(cluster.data.box.list.length - 1)]]);
                        else if(which < 0.8) ops.push(['update', ['level'], ++counter]);
                        else ops.push([cluster.data.box['k' + (counter % 3)] === undefined ? 'insert' : 'update', ['k' + (counter % 3)], ++counter]);
                    }
                    await cluster.change(server, 'box', ops);
                }
                else if(kind < 0.45) {
                    //a change of unknown content, or a forced reload (it reaches only connected clients)
                    cluster.data.box.level = ++counter;
                    cluster.write();
                    const payload = rnd() < 0.5 && box.isConnected() ? {box: 'box', reload: true} : {box: 'box', unknown: true};
                    trace.push(`${server} ${payload.reload ? 'reload' : 'unknown'} level ${counter} (box ${box.isConnected() ? 'connected' : 'away'})`);
                    await cluster.emit(server, payload);
                }
                else if(kind < 0.7) {
                    const value = plain(cluster.data.syncBox);
                    value.volume.level = ++counter;
                    if(rnd() < 0.3) value.sources = rnd() < 0.5 ? [...value.sources, 'in' + counter] : value.sources.slice(0, 1);
                    await cluster.sync(server, 'syncBox', value);
                }
                else await cluster.change(server, 'room', [['update', ['count'], ++counter]], 'b');
            };

            for(let round = 0, rounds = Number(process.env.RESUME_ROUNDS || 100); round < rounds; round++) {
                const steps = Math.floor(rnd() * 4);
                const away = rnd() < 0.7;
                const to = rnd() < 0.3 ? pick(servers) : undefined;
                if(rnd() < 0.15) await cluster.control(pick(servers), {fetchDelay: Math.floor(rnd() * 60)});
                if(away) {
                    await c.away(async () => {
                        for(let i = 0; i < steps; i++) await change();
                        if(rnd() < 0.5) await sleep(Math.floor(rnd() * 40));
                    }, to);
                    //changes while the databoxes resume
                    for(let i = 0, len = Math.floor(rnd() * 3); i < len; i++) await change();
                }
                else for(let i = 0; i < steps; i++) await change();

                trace.push(`round ${round}: away ${away} to ${to}`);
                try {await shows(box, () => cluster.data.box, 8000);}
                catch (err) {
                    console.log(trace.slice(-12).join('\n'));
                    console.log(JSON.stringify(c.responses.connects.map((r: any) => [r.o, r.r, r.v, r.n])));
                    throw err;
                }
                await shows(syncBox, () => cluster.data.syncBox, 8000);
                await shows(room, () => cluster.data.rooms.b, 8000);
                for(const response of c.responses.connects) {
                    const key = response.v === undefined ? 'old' : String(response.r);
                    results[key] = (results[key] || 0) + 1;
                }
                c.responses.clear();
                await cluster.control('A', {fetchDelay: 0});
                await cluster.control('B', {fetchDelay: 0});
            }
            c.close();
            //the fuzz has to hit every way of resuming
            for(const r of [UNCHANGED, TRANSACTIONS, DATA]) assert.ok(results[r] > 0, JSON.stringify(results));
        });
    });
});
