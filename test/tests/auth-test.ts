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
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test fail to access user id 10 controller with guest')
        .request('secretForId10')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test fail to access user id 10 and user controller with guest')
        .request('secretForUserAndId10')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test fail to access user/admin controller with guest')
        .request('secretForAdminOrUser')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test fail to access auth controller with guest')
        .request('secretForAuth')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test fail to access email token controller with guest')
        .request('secretForEmail')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Authenticate as user with token variables')
        .authRequest({email : 'mytest@gmail.de',password : 'secret'})
        .assertThat()
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

    when(testClient,'Test access to user controller with user')
        .request('secretForUser')
        .assertThat()
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Test access to user and userId 10 controller')
        .request('secretForUserAndId10')
        .assertThat()
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Test fail to access all (except: user,admin) controller with user')
        .request('secretForAllExceptAdminOrUser')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test access to user id 10 controller with user id 10')
        .request('secretForId10')
        .assertThat()
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Test fail to access controller with user id 11 and group user with user id 10')
        .request('secretForUserAndId11')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test fail to access controller with user id 11 or group admin with user and id 10')
        .request('secretForAdminOrId11')
        .assertThat()
        .isNotSuccessful()
        .hasError()
        .preset()
        .accessDenied()
        .end()
        .test();

    when(testClient,'Test access to user id 10 or admin controller with user and id 10')
        .request('secretForAdminOrId10')
        .assertThat()
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Test access to admin/user controller with user')
        .request('secretForAdminOrUser')
        .assertThat()
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Test access to auth controller with user')
        .request('secretForAuth')
        .assertThat()
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();

    when(testClient,'Test access to email controller with user')
        .request('secretForEmail')
        .assertThat()
        .isSuccessful()
        .result()
        .equal(0)
        .end()
        .test();
});