import {Config, Controller, ControllerConfig, Register,$single} from 'zation-server';

@Register()
export class SingleInputValidationObjController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : $single({
            properties : {
                name : {
                    type : 'string',
                    maxLength : 20
                },
                age : {
                    type : 'number',
                    maxValue : 100,
                    minValue : 10
                }
            }
        })
    };
}

@Register()
export class SingleInputValidationArrayController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : $single([{
            type : 'string'
        }])
    };
}

@Register()
export class SingleInputValidationAnyOfController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : $single({
            anyOf : {
                name : {
                    type : 'string',
                    maxLength : 8
                },
                id : {
                    type : 'int'
                }
            }
        })
    };
}