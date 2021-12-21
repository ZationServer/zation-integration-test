/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Controller, Register} from 'zation-server';

@Controller.Config({
    access: 'all',
    input: {
        type : 'string',
        minLength : 5,
        maxLength : 8,
        endsWith : 'a'
    }
})
@Register()
export class StringValidationController extends Controller {}