/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Controller, ControllerConfig, Register} from 'zation-server';

@Register()
export class Timeout2Controller extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle() {
        await new Promise(r => setTimeout(r,2000));
    }
}