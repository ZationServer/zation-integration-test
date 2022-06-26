/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {when, Client, assert} from "zation-assured";
import {clientConfig} from "../index.test";
import {PRODUCTS} from "../../src/api/databoxes/products";

const testClient = Client.create(clientConfig);

describe('Databox tests',() => {

    before(() => testClient.connect());
    after(() => testClient.disconnect());

    it('Should process updates correctly.',async () => {
        const db = testClient.databox("userProfile");
        await db.connect('1');

        assert.value(db.data).deepEqual({name: 'Elon',age: 22});

        await when(testClient)
            .transmit("updateUserAge",100)
            .assertThat
            .otherDataboxes(db)
            .dataChangeTriggers()
            .withData().deepEqual({name: 'Elon',age: 100}).end()
            .end()
            .end()
            .test();

        await when(testClient)
            .transmit("updateUserAge",120)
            .assertThat
            .otherDataboxes(db)
            .dataChangeTriggers()
            .withData().deepEqual({name: 'Elon',age: 120}).end()
            .end()
            .end()
            .test();
    });

    it('Should process deletes correctly.',async () => {
        const db = testClient.databox("products");
        await db.connect();

        assert.value(db.data).deepEqual(PRODUCTS);

        await when(testClient)
            .transmit("deleteProduct",'0')
            .assertThat
            .otherDataboxes(db)
            .dataChangeTriggers()
            .withData().deepEqual([PRODUCTS[1]]).end()
            .end()
            .end()
            .test();
    });

    it('Should process inserts correctly.',async () => {
        const db = testClient.databox("products");
        await db.connect();

        assert.value(db.data.length).deepEqual(2);

        await when(testClient)
            .transmit("addProduct",{
                id: '3',
                name: 'Smartphone',
                price: 700
            })
            .assertThat
            .otherDataboxes(db)
            .dataChangeTriggers()
            .withData().deepEqual([...PRODUCTS,{
                name: 'Smartphone',
                price: 700
            }]).end()
            .end()
            .end()
            .test();
    });
});