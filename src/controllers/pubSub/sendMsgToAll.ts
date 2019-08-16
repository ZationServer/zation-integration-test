import {Controller, ControllerConfig, Result, RequestBag, Register} from 'zation-server';

@Register('sendMsgToAll')
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

    async handle(bag : RequestBag,{msg}) {
        await bag.publishInAllCh('msg',{msg : msg});
    }
}