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
        .request('SecretForUser')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test fail to access user id 10 controller with guest')
        .request('SecretForId10')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test fail to access user id 10 and user controller with guest')
        .request('SecretForUserAndId10')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test fail to access user/admin controller with guest')
        .request('SecretForAdminOrUser')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test fail to access auth controller with guest')
        .request('SecretForAuth')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test fail to access email token controller with guest')
        .request('SecretForEmail')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
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
        .request('SecretForUser')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to user and userId 10 controller')
        .request('SecretForUserAndId10')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test fail to access all (except: user,admin) controller with user')
        .request('SecretForAllExceptAdminOrUser')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test access to user id 10 controller with user id 10')
        .request('SecretForId10')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test fail to access controller with user id 11 and group user with user id 10')
        .request('SecretForUserAndId11')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test fail to access controller with user id 11 or group admin with user and id 10')
        .request('SecretForAdminOrId11')
        .assertThat()
        .isNotSuccessful()
        .buildHasError()
        .presets()
        .noAccessWithTokenState()
        .end()
        .test();

    when(testClient,'Test access to user id 10 or admin controller with user and id 10')
        .request('SecretForAdminOrId10')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to admin/user controller with user')
        .request('SecretForAdminOrUser')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to auth controller with user')
        .request('SecretForAuth')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Test access to email controller with user')
        .request('SecretForEmail')
        .assertThat()
        .isSuccessful()
        .assertResult()
        .strictEqual(0)
        .end()
        .test();

    when(testClient,'Http authentication test to user controller')
        .request('SecretForUser')
        .isHttp()
        .assertThat()
        .isSuccessful()
        .test();
});