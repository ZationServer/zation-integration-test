import {Controller, ControllerConfig, Result, Bag, SmallBag, Register} from 'zation-server';

@Register('allAllow')
export class AllAllowController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        inputAllAllow : true
    };

    async handle(bag: Bag, input: any): Promise<any> {
        return input;
    }
}