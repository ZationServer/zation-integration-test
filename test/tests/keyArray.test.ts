/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import * as assert from "assert";
/// <reference types="node" />
import {Cluster, held, plain, same, sleep, waitUntil} from "../cluster/cluster";

/*
content().sync of a key array: the clients get the changed items key by key and keep the order of the source,
also with several servers writing at once.
*/

const ka = (...items: any[]) => ({___ka___: items, k: 'id'});
const item = (id: string, n = 0) => ({id, name: 'Item ' + id, n, kind: 'feature', at: 0});
const START = () => ({
    box: {name: 'start', level: 1, list: []},
    syncBox: {mode: 'film'},
    listBox: ka(item('a'), item('b'), item('c')),
    filtered: {level: 1},
    rooms: {a: {topic: 'a', count: 0}}
});

/** A client on a server with the listBox, and the bytes of the listBox messages it gets. */
async function listClient(cluster: Cluster, server: string) {
    const {Client} = require('zation-client');
    const instance = new Client({hostname: '127.0.0.1', port: cluster.ports[server], path: '/zation', autoReconnect: {active: false}});
    await instance.connect();
    const counted = {bytes: 0, messages: 0};
    const transport = instance.socket._transport;
    const emit = transport.emitMessage.bind(transport);
    transport.emitMessage = (message: any) => {
        if(typeof message === 'string' && message.includes('D>listBox')) {
            counted.bytes += Buffer.byteLength(message);
            counted.messages++;
        }
        return emit(message);
    };
    const databox = instance.databox('listBox');
    await databox.connect();
    return {instance, databox, counted, close: () => instance.disconnect()};
}

describe('Key array sync', function () {
    this.timeout(120000);

    describe('One server', () => {
        let cluster: Cluster;
        before(async () => {cluster = await Cluster.start({A: {}}, START(), {basePort: 4970});});
        after(async () => cluster?.stop());

        it('Should bring the client to the source for changes, additions, removals and moves.', async () => {
            const c = await listClient(cluster, 'A');
            try {
                const steps = [
                    ka(item('a', 1), item('b'), item('c')),
                    ka(item('a', 1), item('b'), item('c'), item('d')),
                    ka(item('a', 1), item('c'), item('d')),
                    //a move and a new item at the front go whole
                    ka(item('d'), item('a', 1), item('c')),
                    ka(item('e'), item('d'), item('a', 2), item('c')),
                    //a removed item comes back at the end
                    ka(item('e'), item('d'), item('a', 2), item('c'), item('b', 5))
                ];
                for(const value of steps) {
                    await cluster.sync('A', 'listBox', value);
                    await waitUntil(() => same(c.databox.data, value), 5000,
                        `Expected ${JSON.stringify(held(value))}, shows ${JSON.stringify(plain(c.databox.data))}`);
                }
            }
            finally {c.close();}
        });

        it('Should send a changed item key by key.', async () => {
            const items: any[] = [];
            for(let i = 0; i < 300; i++) items.push(item('f' + i));
            await cluster.sync('A', 'listBox', ka(...items));
            const c = await listClient(cluster, 'A');
            try {
                const rounds = 20;
                c.counted.bytes = c.counted.messages = 0;
                for(let i = 1; i <= rounds; i++) {
                    const next = items.slice();
                    next[7] = {...items[7], n: i, at: 1000 + i};
                    await cluster.sync('A', 'listBox', ka(...next));
                }
                const perChange = c.counted.bytes / rounds;
                console.log(`      one changed item of 300 (two keys): ${Math.round(perChange)} bytes per change ` +
                    `(the item whole: ${JSON.stringify({...items[7], n: 20, at: 1020}).length} bytes of value, ` +
                    `the list whole: ${JSON.stringify(items).length})`);
                assert.ok(perChange < JSON.stringify(items[7]).length + 120, `${perChange} bytes per change`);
            }
            finally {c.close();}
        });
    });

    describe('Several servers', () => {
        let cluster: Cluster;
        let clients: Awaited<ReturnType<typeof listClient>>[] = [];
        before(async () => {
            cluster = await Cluster.start({A: {}, B: {}, C: {}}, START(), {cluster: true, basePort: 4980});
            clients = await Promise.all(['A', 'B', 'C'].map(server => listClient(cluster, server)));
        });
        after(async () => {
            clients.forEach(c => c.close());
            await cluster?.stop();
        });

        /** Lets the servers sync their values at the same time, without waiting for each other. */
        const atOnce = (values: Record<string, any>) => Promise.all(Object.entries(values).map(([server, value]) =>
            (cluster as any).controls[server].request('emit', {box: 'listBox', sync: value})));
        const allSame = () => clients.every(c => same(c.databox.data, clients[0].databox.data));
        const showSource = async () => {
            await waitUntil(() => clients.every(c => same(c.databox.data, cluster.data.listBox)), 8000,
                `Expected ${JSON.stringify(held(cluster.data.listBox))}, shows ` +
                JSON.stringify(clients.map(c => plain(c.databox.data))));
        };
        /** The source, written before the servers sync. */
        const source = (value: any) => {
            cluster.data.listBox = value;
            cluster.write();
        };

        it('Should bring every client to the source when servers change different items at once.', async () => {
            await cluster.sync('A', 'listBox', ka(item('a'), item('b'), item('c')));
            source(ka(item('a', 1), item('b', 2), item('c', 3)));
            await atOnce({A: ka(item('a', 1), item('b'), item('c')), B: ka(item('a'), item('b', 2), item('c')),
                C: ka(item('a'), item('b'), item('c', 3))});
            await showSource();
        });

        it('Should bring every client to one order when servers add items at once, and to the source with the next sync.', async () => {
            for(let round = 0; round < 10; round++) {
                const base = ka(item('a'), item('b'));
                await cluster.sync('A', 'listBox', base);
                source(ka(item('a'), item('b'), item('x' + round), item('y' + round)));
                await atOnce({A: ka(item('a'), item('b'), item('x' + round)), B: ka(item('a'), item('b'), item('y' + round))});
                await waitUntil(allSame, 8000, 'The clients hold different lists: ' +
                    JSON.stringify(clients.map(c => plain(c.databox.data))));
                await cluster.sync(['A', 'B', 'C'][round % 3], 'listBox', cluster.data.listBox);
                await showSource();
            }
        });

        it('Should bring every client to the source when one server removes an item another changes at once.', async () => {
            await cluster.sync('B', 'listBox', ka(item('a'), item('b'), item('c')));
            source(ka(item('a'), item('c', 9)));
            await atOnce({A: ka(item('a'), item('c')), B: ka(item('a'), item('b'), item('c', 9))});
            await sleep(300);
            await cluster.sync('C', 'listBox', cluster.data.listBox);
            await showSource();
        });

        it('Should end with the source for random changes of random servers at once.', async () => {
            let state = Number(process.env.KEY_ARRAY_SEED || 11);
            const rnd = () => {
                state = state + 0x6D2B79F5 | 0;
                let t = Math.imul(state ^ state >>> 15, 1 | state);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
            const pick = <T>(list: T[]): T => list[Math.floor(rnd() * list.length)];
            let counter = 0;
            /** A change of the source: items change, come at the end, go, move or come before others. */
            const change = (value: any) => {
                const list: any[] = value.___ka___.slice();
                for(let i = 0, len = 1 + Math.floor(rnd() * 3); i < len; i++) {
                    const kind = rnd(), index = Math.floor(rnd() * list.length);
                    if(kind < 0.5 && list.length > 0) list[index] = {...list[index], n: ++counter};
                    else if(kind < 0.7) list.push(item('i' + ++counter));
                    else if(kind < 0.85 && list.length > 1) list.splice(index, 1);
                    else if(kind < 0.93 && list.length > 1) list.unshift(list.splice(index, 1)[0]);
                    else list.splice(index, 0, item('i' + ++counter));
                }
                return ka(...list);
            };
            await cluster.sync('A', 'listBox', ka(item('a'), item('b'), item('c')));
            for(let round = 0, rounds = Number(process.env.KEY_ARRAY_ROUNDS || 40); round < rounds; round++) {
                //each server reads the source when it syncs: at once (the same or each its own change) or one after the other
                const servers = ['A', 'B', 'C'].filter(() => rnd() < 0.6);
                if(servers.length === 0) servers.push(pick(['A', 'B', 'C']));
                const values: Record<string, any> = {};
                let value = cluster.data.listBox;
                for(const server of servers) {
                    if(rnd() < 0.7 || values[servers[0]] === undefined) value = change(value);
                    values[server] = value;
                }
                source(value);
                await atOnce(values);
                if(rnd() < 0.5) await sleep(Math.floor(rnd() * 50));
                if(rnd() < 0.3) {
                    await waitUntil(allSame, 8000, `Round ${round}: the clients hold different lists: ` +
                        JSON.stringify(clients.map(c => plain(c.databox.data))));
                    await cluster.sync(pick(['A', 'B', 'C']), 'listBox', cluster.data.listBox);
                    await showSource();
                }
            }
            await waitUntil(allSame, 8000, 'The clients hold different lists: ' + JSON.stringify(clients.map(c => plain(c.databox.data))));
            await cluster.sync('B', 'listBox', cluster.data.listBox);
            await showSource();
        });
    });
});
