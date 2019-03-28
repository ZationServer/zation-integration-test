import {Controller,ControllerConfig,Result,TaskError,TaskErrorBag,Bag,SmallBag} from 'zation-server';
export class AnyOfValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                id :
                    {
                       anyOf : {
                           id : {
                               type : 'int'
                           },
                           email : {
                               type : 'email'
                           }
                       }
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