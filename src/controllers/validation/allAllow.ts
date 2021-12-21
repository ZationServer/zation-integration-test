/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Controller, Register} from 'zation-server';

@Controller.Config({
    access : 'all',
    input: 'any'
})
@Register()
export class AllAllowController extends Controller
{
    async handle(_, input: any): Promise<any> {
        return input;
    }
}