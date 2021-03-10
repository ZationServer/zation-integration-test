import {describe, when,before,after,create} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient1  = create(Object.assign({apiLevel : 8},clientConfig));
const testClient2  = create(Object.assign({apiLevel : 2},clientConfig));
const testClient3  = create(Object.assign({apiLevel : 1},clientConfig));
const testClient4  = create(clientConfig);

describe('ApiLevel Tests',async () => {

    before(async () => {
        await Promise.all([testClient1,testClient2,testClient3,testClient4].map(async c => {
            await c.connect();
        }));
    });

    after(async () => {
        await Promise.all([testClient1,testClient2,testClient3,testClient4].map(async c => {
            await c.disconnect();
        }));
    });

    describe('Request ApiLevel', () => {

        when(testClient1,'Wrong ApiLevel')
            .request('apiLevel')
            .apiLevel(1)
            .assertThat()
            .isNotSuccessful()
            .hasError()
            .presets()
            .apiLevelIncompatible()
            .end()
            .test();

        when(testClient1,'ApiLevel 2')
            .request('apiLevel')
            .apiLevel(2)
            .assertThat()
            .isSuccessful()
            .assertResult()
            .equal(2)
            .end()
            .test();

        when(testClient2,'ApiLevel 10')
            .request('apiLevel')
            .apiLevel(10)
            .assertThat()
            .isSuccessful()
            .assertResult()
            .equal(5)
            .end()
            .test();
    });

    describe('Connection ApiLevel', () => {

        when(testClient3,'Wrong ApiLevel')
            .request('apiLevel')
            .assertThat()
            .isNotSuccessful()
            .hasError()
            .presets()
            .apiLevelIncompatible()
            .end()
            .test();

        when(testClient2,'ApiLevel 2')
            .request('apiLevel')
            .assertThat()
            .isSuccessful()
            .assertResult()
            .equal(2)
            .end()
            .test();

        when(testClient1,'ApiLevel 8')
            .request('apiLevel')
            .assertThat()
            .isSuccessful()
            .assertResult()
            .equal(5)
            .end()
            .test();
    });

    describe('Default ApiLevel', () => {

        when(testClient4,'ApiLevel 3')
            .request('apiLevel')
            .assertThat()
            .isSuccessful()
            .assertResult()
            .equal(2)
            .end()
            .test();
    });
});