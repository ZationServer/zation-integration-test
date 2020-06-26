import {Controller, ControllerConfig, Register} from 'zation-server';

@Register()
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