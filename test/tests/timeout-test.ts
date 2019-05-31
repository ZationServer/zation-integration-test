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

    describe('Ws Timeout', () => {

        when(testClient,'Timeout reached')
            .request('timeout2')
            .timeout(1000)
            .assertThat()
            .throwsTimeoutError()
            .test();

        when(testClient,'Timeout not reached')
            .request('timeout2')
            .timeout(5000)
            .assertThat()
            .throwsTimeoutError(false)
            .isSuccessful()
            .test();
    });

    describe('Http Timeout', () => {

        when(testClient,'Timeout reached')
            .request('timeout2')
            .isHttp()
            .timeout(1000)
            .assertThat()
            .throwsTimeoutError()
            .test();

        when(testClient,'Timeout not reached')
            .request('timeout2')
            .isHttp()
            .timeout(5000)
            .assertThat()
            .throwsTimeoutError(false)
            .isSuccessful()
            .test();
    });
});