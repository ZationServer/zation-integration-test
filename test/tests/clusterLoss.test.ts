/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {plain, same, sleep, SoakClient, SoakCluster, waitUntil} from "../../soak/cluster";

/*
Transactions that one server misses from another: each case ended with wrong data on a client
before zation-server 3.0.0-beta.3 (with ziron 9.12.0) and zation-client 3.0.0-beta.2.
*/
describe('Cluster loss tests', function () {
    this.timeout(60000);

    let cluster: SoakCluster;
    let client: SoakClient;
    let member = 0;
    let clock = 0;
    const timestamp = () => clock = Math.max(clock + 1, Date.now());

    before(async () => {
        cluster = await SoakCluster.start({basePort: 5400});
        client = await cluster.addClient('B');
    });
    after(async () => cluster?.stop());
    afterEach(async () => {
        await cluster.heal();
        await client.closeDatabox('items');
    });

    async function open(on = 'B'): Promise<string> {
        const name = 'loss' + ++member;
        cluster.db.items[name] = {a: 1};
        cluster.write();
        if(client.server !== on) {
            client.drop(on);
            await waitUntil(() => !client.instance.connected, 5000);
            await waitUntil(() => client.instance.connected, 5000);
        }
        await client.open('items', 'items', name);
        return name;
    }

    /** Writes the source first, then lets the server emit. */
    async function set(server: string, name: string, key: string, value: any) {
        cluster.db.items[name][key] = value;
        cluster.write();
        await cluster.emit(server, {box: 'items', member: name, ops: [['set', key, value]], timestamp: timestamp()});
    }

    async function shows(name: string, timeout = 10000) {
        await waitUntil(() => same(client.databoxes.items.data, cluster.db.items[name]), timeout,
            `Shows ${JSON.stringify(plain(client.databoxes.items.data))}, source ${JSON.stringify(cluster.db.items[name])}`);
    }

    it('Should bring a client up to date when its server missed transactions while its broker link was down.', async () => {
        const name = await open();
        for(const link of cluster.links.B) link.setDown(true);
        await sleep(100);
        await set('A', name, 'b', 2);
        await sleep(300);
        for(const link of cluster.links.B) link.setDown(false);
        await shows(name);
    });

    it('Should bring a client up to date when a transaction was lost on the way to the broker.', async () => {
        const name = await open();
        const cut = cluster.links.A[0].cut(200);
        await sleep(20);
        await set('A', name, 'b', 3);
        await cut;
        await shows(name);
    });

    it('Should bring a client up to date when the broker restarted during a change.', async () => {
        const name = await open();
        const restart = cluster.restartBroker(0, 300);
        await sleep(50);
        await set('A', name, 'b', 4);
        await restart;
        await shows(name, 15000);
    });

    it('Should bring a client up to date when the change came before the new subscription was active.', async () => {
        //longer than the wait for the last transaction data of other servers (500 ms)
        for(const link of cluster.links.B) link.delay(900);
        const name = await open();
        await set('A', name, 'b', 5);
        for(const link of cluster.links.B) link.delay(0);
        await shows(name);
    });

    it('Should bring a client up to date when the server that emitted died before its transaction reached the broker.', async () => {
        const name = await open();
        for(const link of cluster.links.A) link.setDown(true);
        await sleep(50);
        await set('A', name, 'b', 6);
        await cluster.restartServer('A', 100);
        for(const link of cluster.links.A) link.setDown(false);
        await shows(name, 15000);
    });

    it('Should end without a deleted key when an older set of another server comes after the delete.', async () => {
        const name = await open('C');
        for(const link of cluster.links.A) link.delay(300);
        const older = timestamp();
        cluster.db.items[name].k = 1;
        delete cluster.db.items[name].k;
        cluster.write();
        await cluster.emit('B', {box: 'items', member: name, ops: [['delete', 'k']], timestamp: timestamp()});
        await cluster.emit('A', {box: 'items', member: name, ops: [['set', 'k', 1]], timestamp: older});
        await sleep(600);
        for(const link of cluster.links.A) link.delay(0);
        await shows(name);
    });
});
