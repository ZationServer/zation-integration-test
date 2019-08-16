import {Controller, ControllerConfig, Result, RequestBag, Register} from 'zation-server';

@Register('allAllow')
export class AllAllowController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        allowAnyInput : true
    };

    async handle(bag: RequestBag, input: any): Promise<any> {
        return input;
    }
}