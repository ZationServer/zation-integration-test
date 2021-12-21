/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {start,StartMode,Config} from 'zation-server';
import {ClientOptions}  from 'zation-assured';

import "../src/configs/app.config.ts";
import "../src/configs/server.config.ts";

const TEST_PORT = 3011;

export const clientConfig : ClientOptions = {
    port: TEST_PORT,
    system: 'T',
    version: 4.5
};

Config.serverConfig({
    port: TEST_PORT,
    hostname: 'localhost',
    origins: '*:*',
    debug: false,
}).register(true);

before(async () => start(Config.configurations,StartMode.Test));

