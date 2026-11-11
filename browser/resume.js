/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Client} from 'zation-client';

/**
 * Many clients on one page (like many devices on one network) with a reconnect clock of a minute.
 * When the network comes back, each one waits a random time up to resumeRandomness (default 500 ms),
 * so that they do not come back at the same moment. A call of reconnectNow by the app goes at once.
 * window.zation lets the runner drop the connections (the server closes them with 4100)
 * and read when each client connected again.
 */
const params = new URLSearchParams(location.search);
const clients = [];
const connectedAt = [];
let onlineAt = null, plans = null;
window.addEventListener('online', () => {
    onlineAt = performance.now();
    //after the clients took the event: in how many ms each one tries (null: at once)
    setTimeout(() => plans = clients.map(client => client.nextReconnectAt === null ? null : client.nextReconnectAt - Date.now()));
});

for(let i = 0; i < 12; i++) {
    const client = new Client({
        hostname: 'localhost',
        port: Number(params.get('port')),
        system: 'T',
        version: 4.5,
        autoReconnect: {delays: [60000]}
    });
    client.onConnect(() => connectedAt[i] = performance.now());
    clients.push(client);
}

window.zation = {
    connected: () => clients.every(client => client.connected),
    planned: () => clients.every(client => client.nextReconnectAt !== null),
    drop: () => {
        connectedAt.length = 0;
        onlineAt = plans = null;
        for(const client of clients) client.transmit('dropConnection', 4100);
    },
    plans: () => plans,
    /** How long after the online event each client connected (ms). */
    afterOnline: () => clients.map((_, i) => connectedAt[i] - onlineAt),
    /** Calls reconnectNow of the first client and tells how long it took to connect (ms). */
    reconnectNow: async () => {
        const start = performance.now();
        clients[0].reconnectNow();
        const planned = clients[0].nextReconnectAt;
        await new Promise(resolve => clients[0].onceConnect(resolve));
        return {ms: performance.now() - start, planned};
    }
};
for(const client of clients) client.connect();
