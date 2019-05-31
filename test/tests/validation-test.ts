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

    describe('Complex Validation', () => {

        when(testClient,'Correct input')
            .request('complexValidation')
            .data(
                {
                    animal : {name : 'Tara',likeToBark: true},
                    persons : [{name : 'Max',age : 25},{name : 'Tim',age : 20}]
                })
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'Wrong input')
            .request('complexValidation')
            .data(
                {
                    animal : {name : 'Tara',likeToBark: true},
                    persons : [{name : 'Max',age : 25}]
                })
            .assertThat()
            .isNotSuccessful()
            .buildHasError()
            .presets()
            .inputArrayNotMatchWithMinLength()
            .end()
            .test();
    });

    describe('Validation Check Request', () => {

        describe('Param based',() => {

            describe('Full',() => {
                when(testClient,'Correct input')
                    .validationRequest('complexValidation')
                    .check([],{
                        animal : {name : 'Tara',likeToBark: true},
                        persons : [{name : 'Max',age : 25},{name : 'Tim',age : 20}]
                    })
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input')
                    .validationRequest('complexValidation')
                    .check([],{
                        animal : {name : 'Tara',likeToBark: true},
                        persons : [{name : 'Max',age : 25}]
                    })
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputArrayNotMatchWithMinLength()
                    .end()
                    .test();
            });

            describe('Full with Http',() => {
                when(testClient,'Correct input')
                    .validationRequest('complexValidation')
                    .isHttp()
                    .check([],{
                        animal : {name : 'Tara',likeToBark: true},
                        persons : [{name : 'Max',age : 25},{name : 'Tim',age : 20}]
                    })
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input')
                    .validationRequest('complexValidation')
                    .isHttp()
                    .check([],{
                        animal : {name : 'Tara',likeToBark: true},
                        persons : [{name : 'Max',age : 25}]
                    })
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputArrayNotMatchWithMinLength()
                    .end()
                    .test();
            });

            describe('One model',() => {
                when(testClient,'Correct input (AnyOf)')
                    .validationRequest('complexValidation')
                    .check(['animal'],{name : 'Tara',likeToBark: true})
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Correct input (AnyOf)')
                    .validationRequest('complexValidation')
                    .check(['animal'],{name : 'Tara'})
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input')
                    .validationRequest('complexValidation')
                    .check(['animal'],{name : 'T'})
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputNotMatchWithMinLength()
                    .end()
                    .test();
            });

            describe('Inner value model',() => {
                when(testClient,'Correct input (with string path)')
                    .validationRequest('complexValidation')
                    .check('animal.dog.name','Tara')
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Correct input (with array path)')
                    .validationRequest('complexValidation')
                    .check(['animal','dog','name'],'Tara')
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input (with string path)')
                    .validationRequest('complexValidation')
                    .check('animal.dog.name','T')
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputNotMatchWithMinLength()
                    .end()
                    .test();

                when(testClient,'Wrong input (with array path)')
                    .validationRequest('complexValidation')
                    .check(['animal','dog','name'],'T')
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputNotMatchWithMinLength()
                    .end()
                    .test();
            });

            describe('Array model',() => {
                when(testClient,'Correct input (array item)')
                    .validationRequest('complexValidation')
                    .check('persons.array',{name : 'Tim',age : 20})
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input (array item)')
                    .validationRequest('complexValidation')
                    .check('persons.array',{name : 'Tim'})
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .objectPropertyIsMissing()
                    .end()
                    .test();

                when(testClient,'Correct input (array item inner properties)')
                    .validationRequest('complexValidation')
                    .check('persons.array.name','Tim')
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input (array item inner properties)')
                    .validationRequest('complexValidation')
                    .check('persons.array.name',{name : 0})
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputIsNotTypeString()
                    .end()
                    .test();

                when(testClient,'Correct input (array model)')
                    .validationRequest('complexValidation')
                    .check('persons',[{name : 'Max',age : 25},{name : 'Tim',age : 20}])
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input (min length) (array model)')
                    .validationRequest('complexValidation')
                    .check('persons',[{name : 'Max',age : 25}])
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputArrayNotMatchWithMinLength()
                    .end()
                    .test();

                when(testClient,'Wrong input (item wrong) (array model)')
                    .validationRequest('complexValidation')
                    .check('persons',[{name : 'Max',age : 25},{name : 'Tim',age : 200}])
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputNotMatchWithMaxValue()
                    .infoHas({inputPath : 'persons.1.age'})
                    .end()
                    .test();
            });

            describe('Wrong path',() => {

                when(testClient,'Path can not resolved')
                    .validationRequest('complexValidation')
                    .check('persons.array.lastName','LastName')
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputPathNotResolvable()
                    .end()
                    .test();
            });
        });



        describe('Single input',() => {

            describe('Full',() => {
                when(testClient,'Correct input')
                    .validationRequest('singleInputValidation')
                    .check('',{name : 'Luca',age : 20})
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input')
                    .validationRequest('singleInputValidation')
                    .check('',{name : 'Luca',age : 200})
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputNotMatchWithMaxValue()
                    .end()
                    .test();
            });

            describe('Multi Check Full',() => {
                when(testClient,'Correct input')
                    .validationRequest('singleInputValidation')
                    .check('',{name : 'Luca',age : 20})
                    .check('',{name : 'Leonie',age : 50})
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input')
                    .validationRequest('singleInputValidation')
                    .check('',{name : 'Luca',age : 20})
                    .check('',{name : 'Tim',age : 18})
                    .check('',{name : 'Tom',age : 200})
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputNotMatchWithMaxValue()
                    .end()
                    .test();
            });

            describe('Single value model',() => {
                when(testClient,'Correct input')
                    .validationRequest('singleInputValidation')
                    .check('name','Luca')
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'Wrong input')
                    .validationRequest('singleInputValidation')
                    .check('name',0)
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputIsNotTypeString()
                    .end()
                    .test();
            });

            describe('Wrong path',() => {

                when(testClient,'Path can not resolved')
                    .validationRequest('singleInputValidation')
                    .check('lastName','LastName')
                    .assertThat()
                    .isNotSuccessful()
                    .buildHasError()
                    .presets()
                    .inputPathNotResolvable()
                    .end()
                    .test();
            });
        });

    });

});