import {Controller, ControllerConfig, Result, Bag, SmallBag, Register} from 'zation-server';

@Register('objectValidation')
export class ObjectValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                dog : {
                    properties : {
                        name : {
                            type : 'string',
                            maxLength : 10
                        },
                        colour : {
                            type : 'string',
                            enum : ['red','black','yellow']
                        },
                        age : {
                            type : 'int',
                            maxValue : 20,
                            minValue : 0
                        }
                    }
                }
            }
    };
}