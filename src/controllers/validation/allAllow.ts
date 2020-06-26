import {Controller, ControllerConfig, Register} from 'zation-server';

@Register()
export class AllAllowController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        allowAnyInput : true
    };

    async handle(_, input: any): Promise<any> {
        return input;
    }
}