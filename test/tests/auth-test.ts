import {describe, when,before,after,create} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient  = create(clientConfig);

describe('Authentication Tests',async () => {

    before(async () => {
        await testClient.connect();
    });

    after(async () => {
       await testClient.disconnect();
    });

    when(testClient,'Test fail to access user controller with guest')
        .request('secretForUser')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithAuth()
        .end()
        .test();

    when(testClient,'Test fail to access user id 10 controller with guest')
        .request('secretForId10')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithAuth()
        .end()
        .test();

    when(testClient,'Test fail to access user/admin controller with guest')
        .request('secretForAdminOrUser')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithAuth()
        .end()
        .test();

    when(testClient,'Test fail to access auth controller with guest')
        .request('secretForAuth')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithAuth()
        .end()
        .test();

    when(testClient,'Test fail to access email token controller with guest')
        .request('secretForEmail')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithAuth()
        .end()
        .test();

    when(testClient,'Authenticate as user with token variables')
        .authRequest({email : 'mytest@gmail.de',password : 'secret'})
        .assertThat()
        .isSuccessful()
        .client(testClient)
        .isAuthenticated()
        .hasAuthUserGroup('user')
        .hasUserId(10)
        .assertTokenVariables()
        .ownInclude({email : 'mytest@gmail.de'})
        .end()
        .end()
        .test();

    when(testClient,'Test access to user controller with user')
        .request('secretForUser')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to user id 10 controller with user id 10')
        .request('secretForId10')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to admin/user controller with user')
        .request('secretForAdminOrUser')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to auth controller with user')
        .request('secretForAuth')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to email controller with user')
        .request('secretForEmail')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Http authentication test to user controller')
        .request('secretForUser')
        .isHttp()
        .assertThat()
        .isSuccessful()
        .test();
});