/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Client} from "zation-client";
import {clientConfig} from "../index.test";
import * as assert from "assert";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const waitUntil = async (condition: () => boolean, timeout: number) => {
    const start = Date.now();
    while(!condition()) {
        if(Date.now() - start > timeout) throw new Error('Condition not reached in time.');
        await wait(20);
    }
};

describe('Reconnect tests', function() {
    this.timeout(15000);

    const client = Client.create(clientConfig);
    const other = Client.create(clientConfig);

    before(async () => {
        await client.connect();
        await other.connect();
    });
    after(() => {
        client.disconnect();
        other.disconnect();
    });

    it('Should restore channel subscriptions after a reconnect.', async () => {
        const news = client.channel('news');
        await news.subscribe();

        client.disconnect();
        await wait(100);
        await client.connect();
        await waitUntil(() => news.isSubscribed(), 3000);

        const publishPromise = news.oncePublish('news', 3000);
        await other.transmit('publishNews', {title: 'Beta', description: 'Reconnect works'});
        const [data] = await publishPromise;
        assert.deepStrictEqual(data, {title: 'Beta', description: 'Reconnect works'});
        news.unsubscribe();
    });

    it('Should reconnect a databox and load changes that happened while disconnected.', async () => {
        const db = client.databox('userProfile');
        await db.connect('1');
        assert.strictEqual(typeof (db.data as any).age, 'number');

        client.disconnect();
        await wait(100);
        await other.transmit('updateUserAge', 55);
        await wait(200);

        await client.connect();
        await waitUntil(() => db.isConnected() && (db.data as any)?.age === 55, 5000);

        // live updates work again after the reconnect
        await other.transmit('updateUserAge', 56);
        await waitUntil(() => (db.data as any)?.age === 56, 3000);
        await db.disconnect();
    });

    it('Should keep working for requests after several reconnects.', async () => {
        const before = await client.request('apiLevel');
        for(let i = 0; i < 3; i++) {
            client.disconnect();
            await wait(50);
            await client.connect();
        }
        assert.strictEqual(await client.request('apiLevel'), before);
    });
});
