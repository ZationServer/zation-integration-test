import {Controller, ControllerConfig, Result, Bag, SmallBag, Register} from 'zation-server';

@Register('logIn')
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

    async handle(bag : Bag,{email,password}) {
        await bag.authenticate('user',10,{email : email});
    }

    async initialize(smallBag : SmallBag)
    {

    }

    async wrongInput(bag : Bag,input)
    {

    }
}