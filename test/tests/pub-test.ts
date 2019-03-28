import {describe, when, before} from "zation-assured";
import {testClient, testClient2} from "../index.test";

describe('Pub/Sub Tests',async () => {

    before(async () => {
        await Promise.all([testClient.subAllCh(),testClient2.subAllCh()]);

        testClient2.channelReact().onPubAllCh(null,() => {
           console.log('pub all')
        });
    });

    when(testClient,'All channel pub')
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
});