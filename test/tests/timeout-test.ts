import {describe, when,before,after,create} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient  = create(clientConfig);

describe('Timeout Tests',async () => {

    before(async () => {
        await testClient.connect();
    });

    after(async () => {
        await testClient.disconnect();
    });

    when(testClient,'Timeout reached')
        .request('timeout2')
        .responseTimeout(1000)
        .assertThat()
        .throwsTimeoutError()
        .test();

    when(testClient,'Timeout not reached')
        .request('timeout2')
        .responseTimeout(5000)
        .assertThat()
        .throwsTimeoutError(false)
        .isSuccessful()
        .test();
});