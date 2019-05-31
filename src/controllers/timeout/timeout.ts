import {Controller, ControllerConfig, Result, Bag, SmallBag, Register} from 'zation-server';

@Register('timeout2')
export class Timeout2Controller extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle(bag : Bag,{msg}) {
        await new Promise(r => setTimeout(r,2000));
    }
}