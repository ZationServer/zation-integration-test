/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {when,create} from "zation-assured";
import {clientConfig} from "../index.test";

const testClient  = create(clientConfig);

describe('Timeout tests',function() {

    this.timeout(5000);
    before(() => testClient.connect())
    after(() => testClient.disconnect());

    when(testClient,'Should fail with reached response timeout.')
        .request('timeout2',undefined,{responseTimeout: 1000})
        .assertThat
        .throwsTimeoutError()
        .test();

    when(testClient,'Should work with not reached response timeout.')
        .request('timeout2',undefined,{responseTimeout: 5000})
        .assertThat
        .throwsTimeoutError(false)
        .isSuccessful()
        .test();
});