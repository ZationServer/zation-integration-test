/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {when, create} from "zation-assured";
import {clientConfig} from "../index.test";

const testClient  = create(clientConfig);

describe('Channel tests',() => {

    before(() => testClient.connect());
    after(() => testClient.disconnect());

    when(testClient,'Should get publish into channel member.')
        .transmit("publishMessage",{chatId: '1',content: "Hello!"})
        .assertThat
        .client()
        .channel("chat",'1')
        .getsPublish("message")
            .withData().equal("Hello!").end()
            .end()
        .end()
        .end()
        .test();

    when(testClient,'Should get publish into static channel.')
        .transmit("publishNews",{title: "Zation 3.0",description: "New Zation version 3.0 release day!"})
        .assertThat
        .client()
        .channel("news")
        .getsPublish("news")
        .withData().deepEqual({title: "Zation 3.0",description: "New Zation version 3.0 release day!"}).end()
        .end()
        .end()
        .end()
        .test();
});