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