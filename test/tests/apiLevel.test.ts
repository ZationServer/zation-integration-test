/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {when,create} from "zation-assured";
import {clientConfig} from "../index.test";

const testClient1  = create(Object.assign({apiLevel : 8},clientConfig));
const testClient2  = create(Object.assign({apiLevel : 2},clientConfig));
const testClient3  = create(Object.assign({apiLevel : 1},clientConfig));
const testClient4  = create(clientConfig);

describe('ApiLevel tests',() => {

    before(() => Promise.all([testClient1,testClient2,testClient3,testClient4].map(c => c.connect())));
    after(() => Promise.all([testClient1,testClient2,testClient3,testClient4].map(c => c.disconnect())));

    describe('Request ApiLevel', () => {

        when(testClient1,'Should fail with incompatible ApiLevel.')
            .request('apiLevel',undefined,{apiLevel: 1})
            .assertThat
            .isNotSuccessful()
            .hasError()
            .preset()
            .apiLevelIncompatible()
            .end()
            .test();

        when(testClient1,'Should select same ApiLevel.')
            .request('apiLevel',undefined,{apiLevel: 2})
            .assertThat
            .isSuccessful()
            .result()
            .equal(2)
            .end()
            .test();

        when(testClient2,'Should select lower ApiLevel that is available.')
            .request('apiLevel',undefined,{apiLevel: 10})
            .assertThat
            .isSuccessful()
            .result()
            .equal(5)
            .end()
            .test();
    });

    describe('Connection ApiLevel', () => {

        when(testClient3,'Should fail with incompatible ApiLevel.')
            .request('apiLevel')
            .assertThat
            .isNotSuccessful()
            .hasError()
            .preset()
            .apiLevelIncompatible()
            .end()
            .test();

        when(testClient2,'Should select same ApiLevel.')
            .request('apiLevel')
            .assertThat
            .isSuccessful()
            .result()
            .equal(2)
            .end()
            .test();

        when(testClient1,'Should select lower ApiLevel that is available.')
            .request('apiLevel')
            .assertThat
            .isSuccessful()
            .result()
            .equal(5)
            .end()
            .test();
    });

    describe('Default ApiLevel', () => {

        when(testClient4,'Should select same ApiLevel.')
            .request('apiLevel')
            .assertThat
            .isSuccessful()
            .result()
            .equal(2)
            .end()
            .test();
    });
});
