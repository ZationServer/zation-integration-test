import {describe, when,before,after,create} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient  = create(clientConfig);

describe('Result Tests',async () => {

    before(async () => {
        await testClient.connect();
    });

    after(async () => {
        await testClient.disconnect();
    });

    describe('Result test', () => {

        when(testClient,'Same result')
            .request('result')
            .data({result : {name : 'luca'},statusCode : 200})
            .assertThat()
            .isSuccessful()
            .assertResult()
            .objectAssert()
            .deepEqual({name : 'luca'})
            .end()
            .end()
            .hasStatusCode(200)
            .test();
    });
});