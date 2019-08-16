import {Controller, ControllerConfig, Result, RequestBag, Register} from 'zation-server';

@Register('timeout2')
export class Timeout2Controller extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle(bag : RequestBag,{msg}) {
        await new Promise(r => setTimeout(r,2000));
    }
}