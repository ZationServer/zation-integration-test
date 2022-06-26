/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Controller, Register} from 'zation-server';

@Controller.Config({
    access : 'all',
    input : [{
        type : 'string',
        maxLength : 30
    },{maxLength : 3}]
})
@Register()
export class ArrayValidationController extends Controller {}