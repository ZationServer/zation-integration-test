import {Controller, ControllerConfig, Result, RequestBag, Register} from 'zation-server';

@Register().asAuthController()
export class LogInController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                email :
                    {
                        type : 'email',
                    },
                password :
                    {
                        type : 'string',
                        minLength : 3
                    },
            }
    };

    async handle(bag : RequestBag,{email,password}) {
        await bag.authenticate('user',10,{email : email});
    }
}