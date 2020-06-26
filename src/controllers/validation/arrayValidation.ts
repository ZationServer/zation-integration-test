import {Controller, ControllerConfig, Register} from 'zation-server';

@Register()
export class ArrayValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                names : [{
                    type : 'string',
                    maxLength : 30
                },{maxLength : 3}]
            }
    };
}