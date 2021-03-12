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
            .data(10)
            .assertThat()
            .isNotSuccessful()
            .hasError()
                .preset()
                .valueNotMatchesWithType()
                .withInfo({path : ''})
                .end()
            .test();

        when(testClient,'Wrong string')
            .request('stringValidation')
            .data('thisIsATestString')
            .assertThat()
            .isNotSuccessful()
            .hasError()
                .preset()
                .valueNotMatchesWithMaxLength()
                .end()
            .hasError()
                .preset()
                .valueNotMatchesWithEndsWith()
                .end()
            .test();
    });

    describe('AnyOf Validation', () => {

        when(testClient,'Not matching type')
            .request('anyOfValidation')
            .data('luca')
            .assertThat()
            .isNotSuccessful()
            .hasError()
                .preset()
                .noAnyOfMatch()
                .end()
            .test();

        when(testClient,'Matching email')
            .request('anyOfValidation')
            .data('luca@test.de')
            .assertThat()
            .isSuccessful()
            .test();
    });

    describe('Object Validation', () => {

        when(testClient,'Correct object')
            .request('objectValidation')
            .data({name : 'Tara',colour : 'black',age : 10})
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'Not valid object')
            .request('objectValidation')
            .data({name : 'Tara',colour : 'cool',age : 10})
            .assertThat()
            .isNotSuccessful()
            .hasError()
                .preset()
                .valueNotMatchesWithIn()
                .withInfo({path : 'colour'})
                .end()
            .test();
    });

    describe('Object Class Validation', () => {

        when(testClient,'Correct object')
            .request('objectClassValidation')
            .data({deviceId : 10,producer : 'Samsung',screenSize : 5.2})
            .assertThat()
            .isSuccessful()
            .result()
            .equal('Samsung-10')
            .end()
            .test();

        when(testClient,'Not valid object')
            .request('objectClassValidation')
            .data({deviceId : 10.14,producer : 'Samsung',screenSize : 12.2})
            .assertThat()
            .isNotSuccessful()
            .hasError()
            .preset()
            .valueNotMatchesWithMaxValue()
            .atPath('screenSize')
            .end()
            .hasError()
            .preset()
            .valueNotMatchesWithType()
            .atPath('deviceId')
            .end()
            .test();
    });

    describe('Array Validation', () => {

        when(testClient,'Correct array')
            .request('arrayValidation')
            .data(['luca','tara','fabio'])
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'To long array')
            .request('arrayValidation')
            .data(['luca','tara','fabio','peter','gagan'])
            .assertThat()
            .isNotSuccessful()
            .hasError()
                .preset()
                .arrayNotMatchesWithMaxLength()
                .end()
            .test();

        when(testClient,'Not type array')
            .request('arrayValidation')
            .data({})
            .assertThat()
            .isNotSuccessful()
            .hasError()
                .preset()
                .invalidType()
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
            .hasError()
            .preset()
            .arrayNotMatchesWithMinLength()
            .end()
            .test();
    });

    describe('Extend Value Model Optional', () => {

        when(testClient,'Correct input - string')
            .request('extendValueModel')
            .data('Hello')
            .assertThat()
            .isSuccessful()
            .result()
            .equal('Hello')
            .end()
            .test();

        when(testClient,'Correct input - undefined')
            .request('extendValueModel')
            .data(undefined)
            .assertThat()
            .isSuccessful()
            .result()
            .equal(undefined)
            .end()
            .test();

        when(testClient,'Wrong input')
            .request('extendValueModel')
            .data('hi')
            .assertThat()
            .isNotSuccessful()
            .hasError()
            .preset()
            .valueNotMatchesWithMinLength()
            .end()
            .test();
    });

    describe('Validation Check Request', () => {

        describe('Full', () => {
            when(testClient, 'Correct input')
                .validationRequest('complexValidation')
                .check([], {
                    animal: {name: 'Tara', likeToBark: true},
                    persons: [{name: 'Max', age: 25}, {name: 'Tim', age: 20}]
                })
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Wrong input')
                .validationRequest('complexValidation')
                .check([], {
                    animal: {name: 'Tara', likeToBark: true},
                    persons: [{name: 'Max', age: 25}]
                })
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .arrayNotMatchesWithMinLength()
                .end()
                .test();
        });

        describe('One model', () => {
            when(testClient, 'Correct input (AnyOf)')
                .validationRequest('complexValidation')
                .check(['animal'], {name: 'Tara', likeToBark: true})
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Correct input (AnyOf)')
                .validationRequest('complexValidation')
                .check(['animal'], {name: 'Tara'})
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Wrong input')
                .validationRequest('complexValidation')
                .check(['animal'], {name: 'T'})
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMinLength()
                .end()
                .test();
        });

        describe('Inner value model', () => {
            when(testClient, 'Correct input (with string path)')
                .validationRequest('complexValidation')
                .check('animal.dog.name', 'Tara')
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Correct input (with array path)')
                .validationRequest('complexValidation')
                .check(['animal', 'dog', 'name'], 'Tara')
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Wrong input (with string path)')
                .validationRequest('complexValidation')
                .check('animal.dog.name', 'T')
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMinLength()
                .end()
                .test();

            when(testClient, 'Wrong input (with array path)')
                .validationRequest('complexValidation')
                .check(['animal', 'dog', 'name'], 'T')
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMinLength()
                .end()
                .test();
        });

        describe('Array model', () => {
            when(testClient, 'Correct input (array item)')
                .validationRequest('complexValidation')
                .check('persons.type', {name: 'Tim', age: 20})
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Wrong input (array item)')
                .validationRequest('complexValidation')
                .check('persons.type', {name: 'Tim'})
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .missingObjectProperty()
                .end()
                .test();

            when(testClient, 'Correct input (array item inner properties)')
                .validationRequest('complexValidation')
                .check('persons.type.name', 'Tim')
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Wrong input (array item inner properties)')
                .validationRequest('complexValidation')
                .check('persons.type.name', {name: 0})
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithType()
                .end()
                .test();

            when(testClient, 'Correct input (array model)')
                .validationRequest('complexValidation')
                .check('persons', [{name: 'Max', age: 25}, {name: 'Tim', age: 20}])
                .assertThat()
                .isSuccessful()
                .test();

            when(testClient, 'Wrong input (min length) (array model)')
                .validationRequest('complexValidation')
                .check('persons', [{name: 'Max', age: 25}])
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .arrayNotMatchesWithMinLength()
                .end()
                .test();

            when(testClient, 'Wrong input (item wrong) (array model)')
                .validationRequest('complexValidation')
                .check('persons', [{name: 'Max', age: 25}, {name: 'Tim', age: 200}])
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMaxValue()
                .withInfo({path: 'persons.1.age'})
                .end()
                .test();
        });

        describe('Wrong path', () => {

            when(testClient, 'Path can not resolved')
                .validationRequest('complexValidation')
                .check('persons.array.lastName', 'LastName')
                .assertThat()
                .isNotSuccessful()
                .hasError()
                .preset()
                .pathNotResolvable()
                .end()
                .test();
        });

    });

    describe('Can (Not) Be Null', () => {

        describe('ValueModel', () => {
            describe('CanBeNull', () => {
                when(testClient,'With Null')
                    .request('valueCanBeNull')
                    .data(null)
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'With Value')
                    .request('valueCanBeNull')
                    .data('hello')
                    .assertThat()
                    .isSuccessful()
                    .test();
            });
            describe('CanNotBeNull', () => {
                when(testClient,'With Null')
                    .request('valueCanNotBeNull')
                    .data(null)
                    .assertThat()
                    .isNotSuccessful()
                    .hasError()
                    .preset()
                    .valueNotMatchesWithType()
                    .end()
                    .test();

                when(testClient,'With Value')
                    .request('valueCanNotBeNull')
                    .data('hello')
                    .assertThat()
                    .isSuccessful()
                    .test();
            });
        });
        describe('ObjectModel', () => {
            describe('CanBeNull', () => {
                when(testClient,'With Null')
                    .request('objectCanBeNull')
                    .data(null)
                    .assertThat()
                    .isSuccessful()
                    .test();

                when(testClient,'With Value')
                    .request('objectCanBeNull')
                    .data({})
                    .assertThat()
                    .isSuccessful()
                    .test();
            });
            describe('CanNotBeNull', () => {
                when(testClient,'With Null')
                    .request('objectCanNotBeNull')
                    .data(null)
                    .assertThat()
                    .isNotSuccessful()
                    .hasError()
                    .preset()
                    .invalidType()
                    .withInfo({path: ''})
                    .end()
                    .test();

                when(testClient,'With Value')
                    .request('objectCanNotBeNull')
                    .data({})
                    .assertThat()
                    .isSuccessful()
                    .test();
            });
            describe('ArrayModel', () => {
                describe('CanBeNull', () => {
                    when(testClient,'With Null')
                        .request('arrayCanBeNull')
                        .data(null)
                        .assertThat()
                        .isSuccessful()
                        .test();

                    when(testClient,'With Value')
                        .request('arrayCanBeNull')
                        .data(['hello'])
                        .assertThat()
                        .isSuccessful()
                        .test();
                });
                describe('CanNotBeNull', () => {
                    when(testClient,'With Null')
                        .request('arrayCanNotBeNull')
                        .data(null)
                        .assertThat()
                        .isNotSuccessful()
                        .hasError()
                        .preset()
                        .invalidType()
                        .withInfo({path: ''})
                        .end()
                        .test();

                    when(testClient,'With Value')
                        .request('arrayCanNotBeNull')
                        .data(['hello'])
                        .assertThat()
                        .isSuccessful()
                        .test();
                });
            });
            describe('AnyOfModel', () => {
                describe('CanBeNull', () => {
                    when(testClient,'With Null')
                        .request('anyOfCanBeNull')
                        .data(null)
                        .assertThat()
                        .isSuccessful()
                        .test();

                    when(testClient,'With Value')
                        .request('anyOfCanBeNull')
                        .data('hello')
                        .assertThat()
                        .isSuccessful()
                        .test();
                });
                describe('CanNotBeNull', () => {
                    when(testClient,'With Null')
                        .request('anyOfCanNotBeNull')
                        .data(null)
                        .assertThat()
                        .isNotSuccessful()
                        .hasError()
                        .preset()
                        .noAnyOfMatch()
                        .withInfo({path: ''})
                        .end()
                        .test();

                    when(testClient,'With Value')
                        .request('anyOfCanNotBeNull')
                        .data('hello')
                        .assertThat()
                        .isSuccessful()
                        .test();
                });
            });
        });
    });

    describe('All allow input', () => {

        when(testClient,'Check with some input')
            .request('allAllow')
            .data('This is a string')
            .assertThat()
            .isSuccessful()
            .result()
            .equal('This is a string')
            .end()
            .test();
    });

    describe('Nothing allow input', () => {

        when(testClient,'Check with some input')
            .request('nothingAllow')
            .data('This is a string')
            .assertThat()
            .isNotSuccessful()
            .hasError()
            .preset()
            .inputNotAllowed()
            .end()
            .test();
    });

    describe('Object model tuple', () => {

        when(testClient,'Correct array value')
            .request('tupleObjectValidation')
            .data(['str',2,'str'])
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'Correct object value')
            .request('tupleObjectValidation')
            .data({0: 'str', 1: 2, 2: 'str'})
            .assertThat()
            .isSuccessful()
            .test();

        when(testClient,'Wrong array value')
            .request('tupleObjectValidation')
            .data(['str','2','str'])
            .assertThat()
            .isNotSuccessful()
            .hasError()
            .preset()
            .valueNotMatchesWithType()
            .withInfo({path: '1'})
            .end()
            .test();

        when(testClient,'Wrong object value')
            .request('tupleObjectValidation')
            .data({})
            .assertThat()
            .isNotSuccessful()
            .hasError()
            .preset()
            .missingObjectProperty()
            .end()
            .test();
    });

});