import {Controller, Register} from 'zation-server';

@Controller.Config({
    access : 'all',
    input: 'nothing'
})
@Register()
export class NothingAllowController extends Controller
{
    async handle(_, input: any): Promise<any> {
        return input;
    }
}