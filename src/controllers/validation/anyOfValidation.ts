import {Controller, ControllerConfig, Result, Bag, SmallBag, Register} from 'zation-server';

@Register('anyOfValidation')
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
}