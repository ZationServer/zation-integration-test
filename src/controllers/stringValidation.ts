import {Controller,ControllerConfig,Result,TaskError,TaskErrorBag,Bag,SmallBag} from 'zation-server';
export class StringValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                string :
                    {
                        type : 'string',
                        minLength : 5,
                        maxLength : 8,
                        endsWith : 'a'
                    }
            }
    };

    async handle(bag : Bag,{msg}) {

    }

    async initialize(smallBag : SmallBag) {

    }

    async wrongInput(bag : Bag,input) {

    }
}