import {Bag, Config, Controller, ControllerConfig, Register, SmallBag, ValidationTypes} from 'zation-server';

@Register('singleInputValidation')
export class SingleInputValidationController extends Controller
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

    async handle(bag : Bag,{msg}) {

    }

    async initialize(smallBag : SmallBag) {

    }

    async wrongInput(bag : Bag,input) {

    }
}