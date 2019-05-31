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

    when(testClient,'Test access to user controller with guest')
        .request('secretForUser')
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

    when(testClient,'Http authentication test to user controller')
        .request('secretForUser')
        .isHttp()
        .assertThat()
        .isSuccessful()
        .test();
});