/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Client} from 'zation-client';

/**
 * Connects to the test server (?port=), connects the databox counter (?counter=)
 * and counts up. The result is in window.zationResult.
 */
async function run() {
    const params = new URLSearchParams(location.search);
    const counter = params.get('counter');
    const client = new Client({
        hostname: 'localhost',
        port: Number(params.get('port')),
        system: 'T',
        version: 4.5
    });
    await client.connect();
    const databox = client.databox('counter');
    await databox.connect(counter);
    const initial = JSON.parse(JSON.stringify(databox.data));
    const change = databox.onceDataChange(5000);
    await client.transmit('countUp', counter);
    await change;
    const changed = JSON.parse(JSON.stringify(databox.data));
    await databox.disconnect();
    client.disconnect();
    return {initial, changed};
}

run().then(result => window.zationResult = result,
    err => window.zationResult = {error: String(err && err.stack || err)});
