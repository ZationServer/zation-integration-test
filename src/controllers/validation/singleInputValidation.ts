import {RequestBag, Config, Controller, ControllerConfig, Register, ValidationTypes} from 'zation-server';

@Register('singleInputValidationObj')
export class SingleInputValidationObjController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : Config.single({
            properties : {
                name : {
                    type : 'string',
                    maxLength : 20
                },
                age : {
                    type : ValidationTypes.NUMBER,
                    maxValue : 100,
                    minValue : 10
                }
            }
        })
    };
}

@Register('singleInputValidationArray')
export class SingleInputValidationArrayController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : Config.single([{
            type : 'string'
        }])
    };
}

@Register('singleInputValidationAnyOf')
export class SingleInputValidationAnyOfController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : Config.single({
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