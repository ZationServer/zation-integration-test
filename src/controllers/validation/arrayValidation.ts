import {Controller, ControllerConfig, Result, Bag, SmallBag, Register} from 'zation-server';

@Register('arrayValidation')
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