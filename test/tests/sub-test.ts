import {after, before, client, create, describe, ErrorName, SubscribeFailedError} from "zation-assured";
import {clientConfig} from "../index.test";

const testClient  = create(clientConfig);

describe('Sub Tests',async () => {

    before(async () => {
        await testClient.connect();
    });

    after(async () => {
        await testClient.disconnect();
    });

    describe('Sub (with access)', () => {
        client(testClient,'Sub default test1')
            .do(async () => {
               await testClient.subCustomCh('defaultTest1')
            })
            .test();

        client(testClient,'Sub default test2')
            .do(async () => {
                await testClient.subCustomCh('defaultTest2')
            })
            .test();
    });

    describe('Sub (with not access)', () => {
        client(testClient,'Sub auth test1')
            .doShouldThrow(async () => {
                await testClient.subCustomCh('authTest1')
            },'Should not able to sub auth custom channel.')
            .test();

        client(testClient,'Sub auth test2')
            .doShouldThrow(async () => {
                await testClient.subCustomCh('authTest2');
            },'Should not able to sub auth custom channel.')
            .test();
    });

    client(testClient,'Sub unknown channel')
        .doShouldThrow(async () => {
            await testClient.subCustomCh('unknownChannel')
        },'Should not able to sub unknown custom channel.')
        .test();

    describe('Sub custom id ch with id check', () => {
        client(testClient,'Not valid id')
            .doShouldThrow(async () => {
                await testClient.subCustomIdCh('idCheck','342')
            },'Should not able to sub custom id channel with not valid id.')
            .test();

        client(testClient,'Valid id')
            .do(async () => {
                await testClient.subCustomIdCh('idCheck','m2');
            })
            .test();
    });

    describe('Sub custom ch with system check', () => {
        client(testClient,'Not valid system')
            .doShouldThrow(async () => {
                await testClient.subCustomCh('syAccessW',)
            },'Should not able to sub custom channel with not valid system.')
            .test();

        client(testClient,'Valid system')
            .do(async () => {
                await testClient.subCustomCh('syAccessWT');
            })
            .test();
    });

    describe('Sub custom ch with version check', () => {
        client(testClient,'Not valid version')
            .doShouldThrow(async () => {
                await testClient.subCustomCh('vAccessNotValid',)
            },'Should not able to sub custom channel with not valid version.')
            .test();

        client(testClient,'Valid version 1')
            .do(async () => {
                await testClient.subCustomCh('vAccessValid1');
            })
            .test();

        client(testClient,'Valid version 2')
            .do(async () => {
                await testClient.subCustomCh('vAccessValid2');
            })
            .test();
    });
});