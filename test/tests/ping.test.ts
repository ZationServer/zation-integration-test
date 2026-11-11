/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Client} from "zation-client";
import {clientConfig} from "../index.test";
import * as assert from "assert";

describe('Ping tests', () => {

    const client = Client.create(clientConfig);
    before(async () => client.connect());
    after(() => client.disconnect());

    it('Should measure the ping with the performance of Node.js, not in whole milliseconds of Date.', async () => {
        const pings: number[] = [];
        for(let i = 0; i < 5; i++) pings.push(await client.ping());
        assert.ok(pings.some(ping => !Number.isInteger(ping)), `Pings: ${pings.join(', ')}`);
    });
});
