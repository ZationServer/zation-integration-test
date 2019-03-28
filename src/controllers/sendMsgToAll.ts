import {Controller,ControllerConfig,Result,TaskError,TaskErrorBag,Bag,SmallBag} from 'zation-server';
export class SendMsgToAllController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                msg :
                    {
                        type : 'string'
                    }
            }
    };

    async handle(bag : Bag,{msg}) {
        await bag.publishInAllCh('msg',{msg : msg});
    }

    async initialize(smallBag : SmallBag)
    {

    }

    async wrongInput(bag : Bag,input)
    {

    }
}