import {Controller,ControllerConfig,Result,TaskError,TaskErrorBag,Bag,SmallBag} from 'zation-server';
export class SecretForUserController extends Controller
{
    static config : ControllerConfig = {
        access : 'user',
        input : {}
    };

    async handle(bag : Bag,{msg}) {
       return 0;
    }

    async initialize(smallBag : SmallBag)
    {

    }

    async wrongInput(bag : Bag,input)
    {

    }
}