import {Controller, ControllerConfig, Register} from 'zation-server';

@Register()
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
                            in : ['red','black','yellow']
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