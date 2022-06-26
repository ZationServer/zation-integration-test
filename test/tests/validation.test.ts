/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {when, Client} from "zation-assured";
import {clientConfig} from "../index.test";

const testClient = Client.create(clientConfig);

describe('Validation Tests',() => {

    before(() => testClient.connect());
    after(() => testClient.disconnect());

    describe('String validation', () => {

        when(testClient,'Should fail with a wrong data type.')
            .request('stringValidation',10)
            .assertThat
            .isNotSuccessful()
            .hasError()
                .preset()
                .valueNotMatchesWithType()
                .withInfo({path: ''})
                .end()
            .test();

        when(testClient,'Should fail with a string that does not match criteria.')
            .request('stringValidation','thisIsATestString')
            .assertThat
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

    describe('AnyOf validation', () => {

        when(testClient,'Should fail with a not matching value.')
            .request('anyOfValidation','luca')
            .assertThat
            .isNotSuccessful()
            .hasError()
                .preset()
                .noAnyOfMatch()
                .end()
            .test();

        when(testClient,'Should work with a matching value.')
            .request('anyOfValidation','luca@test.de')
            .assertThat
            .isSuccessful()
            .test();
    });

    describe('Object validation', () => {

        when(testClient,'Should work with a correct object.')
            .request('objectValidation',{name: 'Tara',colour: 'black',age: 10})
            .assertThat
            .isSuccessful()
            .test();

        when(testClient,'Should fail with an invalid object.')
            .request('objectValidation',{name: 'Tara',colour: 'cool',age: 10})
            .assertThat
            .isNotSuccessful()
            .hasError()
                .preset()
                .valueNotMatchesWithIn()
                .withInfo({path: 'colour'})
                .end()
            .test();
    });

    describe('Object class validation', () => {

        when(testClient,'Should work with a correct object and return correct combined value.')
            .request('objectClassValidation',{deviceId: 10,producer: 'Samsung',screenSize: 5.2})
            .assertThat
            .isSuccessful()
            .result()
            .equal('Samsung-10')
            .end()
            .test();

        when(testClient,'Should fail with an invalid object.')
            .request('objectClassValidation',{deviceId: 10.14,producer: 'Samsung',screenSize: 12.2})
            .assertThat
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

    describe('Object model tuple validation', () => {

        when(testClient,'Should work with a correct array-based tuple value.')
            .request('tupleObjectValidation',['str',2,'str'])
            .assertThat
            .isSuccessful()
            .test();

        when(testClient,'Should work with a correct object-based tuple value.')
            .request('tupleObjectValidation',{0: 'str', 1: 2, 2: 'str'})
            .assertThat
            .isSuccessful()
            .test();

        when(testClient,'Should fail with an invalid array-based tuple value.')
            .request('tupleObjectValidation',['str','2','str'])
            .assertThat
            .isNotSuccessful()
            .hasError()
            .preset()
            .valueNotMatchesWithType()
            .withInfo({path: '1'})
            .end()
            .test();

        when(testClient,'Should fail with an invalid object-based tuple value.')
            .request('tupleObjectValidation',{})
            .assertThat
            .isNotSuccessful()
            .hasError()
            .preset()
            .missingObjectProperty()
            .end()
            .test();
    });

    describe('Array validation', () => {

        when(testClient,'Should work with a correct array.')
            .request('arrayValidation',['luca','tara','fabio'])
            .assertThat
            .isSuccessful()
            .test();

        when(testClient,'Should fail with a too long array.')
            .request('arrayValidation',['luca','tara','fabio','peter','gagan'])
            .assertThat
            .isNotSuccessful()
            .hasError()
                .preset()
                .arrayNotMatchesWithMaxLength()
                .end()
            .test();

        when(testClient,'Should fail with a wrong data type.')
            .request('arrayValidation',{})
            .assertThat
            .isNotSuccessful()
            .hasError()
                .preset()
                .invalidType()
                .end()
            .test();
    });

    describe('Complex validation', () => {

        when(testClient,'Should work with correct complex data.')
            .request('complexValidation',{
                animal: {name: 'Tara',likeToBark: true},
                persons: [{name: 'Max',age: 25}, {name: 'Tim',age: 20}]
            })
            .assertThat
            .isSuccessful()
            .test();

        when(testClient,'Should fail with invalid data.')
            .request('complexValidation',{
                animal: {name: 'Tara',likeToBark: true},
                persons: [{name: 'Max',age: 25}]
            })
            .assertThat
            .isNotSuccessful()
            .hasError()
            .preset()
            .arrayNotMatchesWithMinLength()
            .end()
            .test();
    });

    describe('Extended value model (optional)', () => {

        when(testClient,'Should work with a correct string value.')
            .request('extendValueModel','Hello')
            .assertThat
            .isSuccessful()
            .result()
            .equal('Hello')
            .end()
            .test();

        when(testClient,'Should work with undefined.')
            .request('extendValueModel',undefined)
            .assertThat
            .isSuccessful()
            .result()
            .equal(undefined)
            .end()
            .test();

        when(testClient,'Should fail with an invalid string value.')
            .request('extendValueModel','hi')
            .assertThat
            .isNotSuccessful()
            .hasError()
            .preset()
            .valueNotMatchesWithMinLength()
            .end()
            .test();
    });

    describe('Validation check request', () => {

        describe('Full', () => {
            when(testClient, 'Should not return any errors with a correct value.')
                .requestValidation('complexValidation',[[[],{
                    animal: {name: 'Tara', likeToBark: true},
                    persons: [{name: 'Max', age: 25}, {name: 'Tim', age: 20}]
                }]])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should return errors with an invalid value.')
                .requestValidation('complexValidation',[[[],{
                    animal: {name: 'Tara', likeToBark: true},
                    persons: [{name: 'Max', age: 25}]
                }]])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .arrayNotMatchesWithMinLength()
                .end()
                .test();
        });

        describe('One model', () => {
            when(testClient, 'Should not return any errors with correct model value - 1.')
                .requestValidation('complexValidation',
                    [[['animal'], {name: 'Tara', likeToBark: true}]])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should not return any errors with correct model value - 2.')
                .requestValidation('complexValidation',
                    [[['animal'], {name: 'Tara'}]])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should return errors with an invalid model value.')
                .requestValidation('complexValidation',
                    [[['animal'], {name: 'T'}]])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMinLength()
                .end()
                .test();
        });

        describe('Inner value model', () => {
            when(testClient, 'Should not return any errors with correct value on string path.')
                .requestValidation('complexValidation',
                    [['animal.dog.name', 'Tara']])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should not return any errors with correct value on array path.')
                .requestValidation('complexValidation',
                    [[['animal', 'dog', 'name'], 'Tara']])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should return errors with an invalid value on string path.')
                .requestValidation('complexValidation',
                    [['animal.dog.name', 'T']])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMinLength()
                .end()
                .test();

            when(testClient, 'Should return errors with an invalid value on array path.')
                .requestValidation('complexValidation',
                    [[['animal', 'dog', 'name'], 'T']])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMinLength()
                .end()
                .test();
        });

        describe('Array model', () => {
            when(testClient, 'Should not return errors with a correct array item.')
                .requestValidation('complexValidation',
                    [['persons.type', {name: 'Tim', age: 20}]])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should return errors with an invalid array value.')
                .requestValidation('complexValidation',
                    [['persons.type', {name: 'Tim'}]])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .missingObjectProperty()
                .end()
                .test();

            when(testClient, 'Should not return errors with a correct array element type property value.')
                .requestValidation('complexValidation',
                    [['persons.type.name', 'Tim']])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should return errors with an invalid array element type property value.')
                .requestValidation('complexValidation',
                    [['persons.type.name', {name: 0}]])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithType()
                .end()
                .test();

            when(testClient, 'Should not return errors with a correct array.')
                .requestValidation('complexValidation',
                    [['persons', [{name: 'Max', age: 25}, {name: 'Tim', age: 20}]]])
                .assertThat
                .isSuccessful()
                .test();

            when(testClient, 'Should return errors with a too small array.')
                .requestValidation('complexValidation',
                    [['persons', [{name: 'Max', age: 25}]]])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .arrayNotMatchesWithMinLength()
                .end()
                .test();

            when(testClient, 'Should return errors with a not matching array element.')
                .requestValidation('complexValidation',
                    [['persons', [{name: 'Max', age: 25}, {name: 'Tim', age: 200}]]])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .valueNotMatchesWithMaxValue()
                .withInfo({path: 'persons.1.age'})
                .end()
                .test();
        });

        describe('Wrong path', () => {

            when(testClient, 'Should fail with an invalid check path.')
                .requestValidation('complexValidation',
                    [['persons.array.lastName', 'LastName']])
                .assertThat
                .isNotSuccessful()
                .hasError()
                .preset()
                .pathNotResolvable()
                .end()
                .test();
        });

    });

    describe('Null constraint', () => {

        describe('Value model', () => {
            describe('Null allowed', () => {
                when(testClient,'Should work with a null value with allowed null values.')
                    .request('valueCanBeNull',null)
                    .assertThat
                    .isSuccessful()
                    .test();

                when(testClient,'Should work with a correct string value with allowed null values.')
                    .request('valueCanBeNull','hello')
                    .assertThat
                    .isSuccessful()
                    .test();
            });
            describe('Null not allowed', () => {
                when(testClient,'Should fail with a null value with not allowed null values.')
                    .request('valueCanNotBeNull',null)
                    .assertThat
                    .isNotSuccessful()
                    .hasError()
                    .preset()
                    .valueNotMatchesWithType()
                    .end()
                    .test();

                when(testClient,'Should work with a correct string value with not allowed null values.')
                    .request('valueCanNotBeNull','hello')
                    .assertThat
                    .isSuccessful()
                    .test();
            });
        });
        describe('Object model', () => {
            describe('Null allowed', () => {
                when(testClient,'Should work with a null value with allowed null values.')
                    .request('objectCanBeNull',null)
                    .assertThat
                    .isSuccessful()
                    .test();

                when(testClient,'Should work with a correct object value with allowed null values.')
                    .request('objectCanBeNull',{})
                    .assertThat
                    .isSuccessful()
                    .test();
            });
            describe('Null not allowed', () => {
                when(testClient,'Should fail with a null value with not allowed null values.')
                    .request('objectCanNotBeNull',null)
                    .assertThat
                    .isNotSuccessful()
                    .hasError()
                    .preset()
                    .invalidType()
                    .withInfo({path: ''})
                    .end()
                    .test();

                when(testClient,'Should work with a correct object value with not allowed null values.')
                    .request('objectCanNotBeNull',{})
                    .assertThat
                    .isSuccessful()
                    .test();
            });
            describe('Array model', () => {
                describe('Null allowed', () => {
                    when(testClient,'Should work with a null value with allowed null values.')
                        .request('arrayCanBeNull',null)
                        .assertThat
                        .isSuccessful()
                        .test();

                    when(testClient,'Should work with a correct array value with allowed null values.')
                        .request('arrayCanBeNull',['hello'])
                        .assertThat
                        .isSuccessful()
                        .test();
                });
                describe('Null not allowed', () => {
                    when(testClient,'Should fail with a null value with not allowed null values.')
                        .request('arrayCanNotBeNull',null)
                        .assertThat
                        .isNotSuccessful()
                        .hasError()
                        .preset()
                        .invalidType()
                        .withInfo({path: ''})
                        .end()
                        .test();

                    when(testClient,'Should work with a correct array value with not allowed null values.')
                        .request('arrayCanNotBeNull',['hello'])
                        .assertThat
                        .isSuccessful()
                        .test();
                });
            });
            describe('AnyOf model', () => {
                describe('Null allowed', () => {
                    when(testClient,'Should work with a null value with allowed null values.')
                        .request('anyOfCanBeNull',null)
                        .assertThat
                        .isSuccessful()
                        .test();

                    when(testClient,'Should work with a correct matching value with allowed null values.')
                        .request('anyOfCanBeNull','hello')
                        .assertThat
                        .isSuccessful()
                        .test();
                });
                describe('Null not allowed', () => {
                    when(testClient,'Should fail with a null value with not allowed null values.')
                        .request('anyOfCanNotBeNull',null)
                        .assertThat
                        .isNotSuccessful()
                        .hasError()
                        .preset()
                        .noAnyOfMatch()
                        .withInfo({path: ''})
                        .end()
                        .test();

                    when(testClient,'Should work with a correct matching value with not allowed null values.')
                        .request('anyOfCanNotBeNull','hello')
                        .assertThat
                        .isSuccessful()
                        .test();
                });
            });
        });
    });

    describe('All allow input', () => {

        when(testClient,'Should work with any input.')
            .request('allAllow','This is a string')
            .assertThat
            .isSuccessful()
            .result()
            .equal('This is a string')
            .end()
            .test();
    });

    describe('Nothing allowed input', () => {

        when(testClient,'Should fail with some input on nothing allowed input.')
            .request('nothingAllowed','This is a string')
            .assertThat
            .isNotSuccessful()
            .hasError()
            .preset()
            .inputNotAllowed()
            .end()
            .test();
    });
});