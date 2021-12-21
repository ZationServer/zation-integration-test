/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {when,create} from "zation-assured";
import {clientConfig} from "../index.test";

const testClient  = create(clientConfig);

describe('Model extra tests',() => {

    before(() => testClient.connect());
    after(() => testClient.disconnect());

    when(testClient,'Complex construct, convert, extend, and prototype should work correctly.')
        .request('objModelExtra',{firstName : 'Luca',lastName : 'Code'})
        .assertThat
        .isSuccessful()
        .result()
        .equal('Hello LUCA.Code END')
        .end()
        .test();
});