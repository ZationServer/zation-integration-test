import {Controller, ControllerConfig, Register} from 'zation-server';

@Register()
export class Timeout2Controller extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle(_,{msg}) {
        await new Promise(r => setTimeout(r,2000));
    }
}