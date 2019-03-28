import {describe, when} from "zation-assured";
import {testClient}     from "../index.test";

describe('LogInController Test',async () => {

    when(testClient,'Test Authenticated')
        .authRequest({email : 'mytest@gmail.de',password : 'secret'})
        .assertThat()
        .isSuccessful()
        .client(testClient)
        .isAuthenticated()
        .hasAuthUserGroup('user')
        .end()
        .test();

    when(testClient,'Test Not Valid Input')
        .authRequest({email : 'notvalid.de'})
        .assertThat()
        .buildHasError()
        .presets()
        .inputIsNotTypeEmail()
        .end()
        .buildHasError()
        .presets()
        .inputPropertyIsMissing()
        .infoHas({propertyName  : 'password'})
        .end()
        .test();
});