/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {
    $extends,
    $model,
    $optional,
    Controller,
    Register
} from 'zation-server';

const minString = $model({
    type : 'string',
    minLength : 2,
});

const animal = $model({
   properties : {
       name : $extends({
           maxLength : 10,
           startsWith : 'T'
       },minString)
   }
});

const person = $model({
    properties : {
        name : {
            maxLength : 20,
            minLength : 0,
            type : 'string'
        },
        age : {
            type : 'number',
            maxValue : 100,
            minValue : 10
        }
    }
});

@Controller.Config({
    access : 'all',
    input : {
        properties: {
            animal : {
                anyOf : {
                    dog : $extends({
                        properties : {
                            likeToBark : {
                                type : 'boolean'
                            }
                        }
                    },animal),
                    cat : $extends({
                        properties : {
                        }
                    },animal)
                }
            },
            persons : [person,{minLength : 2,maxLength : 10}],
            properties : $optional({})
        }
    }
})
@Register()
export class ComplexValidationController extends Controller {}