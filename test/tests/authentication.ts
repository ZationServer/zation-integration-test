/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {when, Client, AUTH_CONTROLLER} from "zation-assured";
import {clientConfig} from "../index.test";

const testClient = Client.create(clientConfig);

describe('Authentication tests',() => {

    before(() => testClient.connect());
    after(() => testClient.disconnect());

    when(testClient,'Should fail to access user controller with guest user')
        .request('secretForUser')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should fail to access user id 10 controller with guest user.')
        .request('secretForId10')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should fail to access user id 10 and user controller with guest user.')
        .request('secretForUserAndId10')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should fail to access user/admin controller with guest.')
        .request('secretForAdminOrUser')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should fail to access auth controller with guest.')
        .request('secretForAuth')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should fail to access email token controller with guest.')
        .request('secretForEmail')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should authenticate as user with token variables properly.')
        .request(AUTH_CONTROLLER,{email : 'mytest@gmail.de',password : 'secret'})
        .assertThat
        .isSuccessful()
        .client()
        .isAuthenticated()
        .hasAuthUserGroup('user')
        .hasUserId(10)
        .tokenPayload()
        .ownInclude({email : 'mytest@gmail.de'})
        .end()
        .end()
        .test();

    when(testClient,'Should be able to access user controller with user.')
        .request('secretForUser')
        .assertThat
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Should be able to access user and user id 10 controller.')
        .request('secretForUserAndId10')
        .assertThat
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Should fail to access all (except: user,admin) controller with user.')
        .request('secretForAllExceptAdminOrUser')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should be able to access user id 10 controller with user id 10.')
        .request('secretForId10')
        .assertThat
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Should fail to access controller with user id 11 and group user with user id 10.')
        .request('secretForUserAndId11')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should fail to access controller with user id 11 or group admin with user and id 10.')
        .request('secretForAdminOrId11')
        .assertThat
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Should be able to access user id 10 or admin controller with user and id 10.')
        .request('secretForAdminOrId10')
        .assertThat
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Should be able to access admin or user controller with user.')
        .request('secretForAdminOrUser')
        .assertThat
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Should be able to access auth controller with user.')
        .request('secretForAuth')
        .assertThat
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Should be able to access email controller with user.')
        .request('secretForEmail')
        .assertThat
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();
});