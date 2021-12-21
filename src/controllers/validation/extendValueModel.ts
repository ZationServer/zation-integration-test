/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {
    Controller,
    Register,
    $extends,
    $optional,
    $model
} from 'zation-server';

const name = $extends($model({
    type: 'string'
}),{minLength: 5});

@Controller.Config({
    access : 'all',
    input: $optional(name)
})
@Register()
export class ExtendValueModelController extends Controller
{
    async handle(_, input: any): Promise<any> {
        return input;
    }
}