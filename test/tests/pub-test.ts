import {describe, when,before,after,create,client} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient1  = create(clientConfig);
const testClient2  = create(clientConfig);

/*
describe('Pub/Sub Tests',async () => {

    before(async () => {
        await Promise.all([testClient1.connect(),testClient2.connect()]);
        await Promise.all([testClient1.subAllCh(),testClient2.subAllCh()]);
    });

    after(async () => {
        await Promise.all([testClient1.disconnect(),testClient2.disconnect()]);
    });

    when(testClient1,'All channel pub')
        .request('sendMsgToAll')
        .data({msg : 'hello'})
        .assertThat()
        .isSuccessful()
        .client(testClient2)
            .getPubAllCh()
            .timeout(200)
            .assertPubData()
                .objectAssert()
                    .deepEqual({msg : 'hello'})
                    .end()
                .end()
            .end()
        .end()
        .test();

    when(testClient1,'All channel unsub pub')
        .do(async () => {testClient2.unsubAllCh();})
        .request('sendMsgToAll')
        .data({msg : 'hello'})
        .assertThat()
        .isSuccessful()
            .client(testClient2)
            .getPubAllCh()
            .not()
            .timeout(200)
            .end()
        .end()
        .test();

    client(testClient1,'Publish in AllWorker channel')
        .doShouldThrow(async () => {
            await new Promise((resolve, reject) => {
                testClient1.getSocket().publish('Z_AW',{},(err) => {
                    err ? reject(err) : resolve();
                })
            });
        },'Should not able to publish in all worker channel')
        .test();
});
*/