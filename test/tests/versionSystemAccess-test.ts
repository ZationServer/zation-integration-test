import {describe, when, before, after, create, forEachClient} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient1  = create(Object.assign({version : 4.0,system : 'T'},clientConfig));
const testClient2  = create(Object.assign({version : 1.0,system : 'A'},clientConfig));

describe('Version System Access Tests',async () => {

    before(async () => {
        await forEachClient(async (c) => {
            await c.connect();
        },testClient1,testClient2);
    });

    after(async () => {
        await forEachClient(async (c) => {
            await c.disconnect();
        },testClient1,testClient2);
    });

    describe('Version Min Access', () => {

        when(testClient1,'Correct min version')
            .request('versionAccessMin')
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient2,'Not correct min version')
            .request('versionAccessMin')
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
            .presets()
            .noAccessWithVersion()
            .end()
            .test();
    });

    describe('Version Exact Access', () => {

        when(testClient1,'Correct version')
            .request('versionAccessExact')
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient2,'Not correct version')
            .request('versionAccessExact')
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
            .presets()
            .noAccessWithVersion()
            .end()
            .test();
    });

    describe('System Access', () => {

        when(testClient1,'Correct system')
            .request('systemAccess')
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient2,'Not correct system')
            .request('systemAccess')
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
            .presets()
            .noAccessWithSystem()
            .end()
            .test();
    });

});