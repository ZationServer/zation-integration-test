/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Client} from 'zation-client';

/**
 * Connects to the test server (?port=) with a reconnect clock of a minute,
 * so that a reconnect that comes sooner was brought forward by an event of the browser.
 * window.zation lets the runner drop the connection (the server closes it with 4100)
 * and read the state.
 */
const params = new URLSearchParams(location.search);
const client = new Client({
    hostname: 'localhost',
    port: Number(params.get('port')),
    system: 'T',
    version: 4.5,
    autoReconnect: {delays: [60000]}
});

window.zation = {
    connected: () => client.connected,
    nextReconnectAt: () => client.nextReconnectAt,
    drop: () => client.transmit('dropConnection', 4100),
    /** Headless Chromium can not hide a page, so the state is set and the event dispatched. */
    setVisibility(state) {
        Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => state});
        document.dispatchEvent(new Event('visibilitychange'));
    }
};
client.connect();
