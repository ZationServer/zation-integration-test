import {Controller,ControllerConfig,Result,TaskError,TaskErrorBag,Bag,SmallBag} from 'zation-server';
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

    async handle(bag : Bag,{msg}) {

    }

    async initialize(smallBag : SmallBag) {

    }

    async wrongInput(bag : Bag,input) {

    }
}