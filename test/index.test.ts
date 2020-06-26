import {start,StartMode,Config}                           from 'zation-server';
import {when,describe,create,before,after,ClientOptions}  from 'zation-assured';
import StarterConfig                                      from './../src/configs/starter.config';

const TEST_PORT = 3001;

export const clientConfig : ClientOptions = {
    port : TEST_PORT,
    system : 'T',
    version : 4.5
};

before(async () => {
    await start(Config.merge(Config.starterConfig({
        port : TEST_PORT,
        hostname : 'localhost',
        origins : '*:*',
        workers : 1,
        brokers : 1,
        debug : false,
        showPrecompiledConfigs : false
    }),StarterConfig),StartMode.Test);
});

