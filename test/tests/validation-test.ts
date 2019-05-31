import {describe, when,before,after,create} from "zation-assured";
import {clientConfig}                       from "../index.test";

const testClient  = create(clientConfig);

describe('Validation Tests',async () => {

    before(async () => {
        await testClient.connect();
    });

    after(async () => {
        await testClient.disconnect();
    });

    describe('String Validation', () => {

        when(testClient,'Wrong type')
            .request('stringValidation')
            .data({string : 10})
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
                .presets()
                .inputIsNotTypeString()
                .infoHas({inputPath : 'string'})
                .end()
            .test();

        when(testClient,'Wrong string')
            .request('stringValidation')
            .data({string : 'thisIsATestString'})
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
                .presets()
                .inputNotMatchWithMaxLength()
                .end()
            .buildHasError()
                .presets()
                .inputIsNotEndsWith()
                .end()
            .test();
    });

    describe('AnyOf Validation', () => {

        when(testClient,'Not matching type')
            .request('anyOfValidation')
            .data({id : 'luca'})
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
                .presets()
                .noAnyOfMatch()
                .end()
            .test();

        when(testClient,'Matching email')
            .request('anyOfValidation')
            .data({id : 'luca@test.de'})
            .assertThat()
            .isSuccessful()
            .test();
    });

    describe('Object Validation', () => {

        when(testClient,'Correct object')
            .request('objectValidation')
            .data({dog : {name : 'Tara',colour : 'black',age : 10}})
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'Not valid object')
            .request('objectValidation')
            .data({dog : {name : 'Tara',colour : 'cool',age : 10}})
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
                .presets()
                .inputIsNotMatchWithEnum()
                .infoHas({inputPath : 'dog.colour'})
                .end()
            .test();
    });

    describe('Array Validation', () => {

        when(testClient,'Correct array')
            .request('arrayValidation')
            .data({names : ['luca','tara','fabio']})
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'To long array')
            .request('arrayValidation')
            .data({names : ['luca','tara','fabio','peter','gagan']})
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
                .presets()
                .inputArrayNotMatchWithMaxLength()
                .end()
            .test();

        when(testClient,'Not type array')
            .request('arrayValidation')
            .data({names : {}})
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
                .presets()
                .arrayWasExpected()
                .end()
            .test();
    });

    describe('Single Input Validation', () => {

        when(testClient,'Correct single input')
            .request('singleInputValidation')
            .data({name : 'Luca',age : 50})
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'Wrong single input')
            .request('singleInputValidation')
            .data({name : 'Luca',age : 200})
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
            .presets()
            .inputNotMatchWithMaxValue()
            .end()
            .test();

        when(testClient,'Wrong single input type')
            .request('singleInputValidation')
            .data([])
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
            .presets()
            .objectWasExpected()
            .end()
            .test();
    });

});