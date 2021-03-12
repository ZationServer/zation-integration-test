import {describe, when,before,after,create} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient  = create(clientConfig);

describe('Model Extra Tests',async () => {

    before(async () => {
        await testClient.connect();
    });

    after(async () => {
        await testClient.disconnect();
    });

    when(testClient,'Test complex construct,convert,extend and prototype')
        .request('objModelExtra')
        .data({firstName : 'Luca',lastName : 'Code'})
        .assertThat()
        .isSuccessful()
        .result()
        .equal('Hello LUCA.Code END')
        .end()
        .test();
});