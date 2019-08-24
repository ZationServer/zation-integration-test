import {RequestBag, Config, Controller, ControllerConfig, Register, ValidationType} from 'zation-server';

Config.defineModel('SomeObj',{
    properties : {
    },
    construct: function () {
        this.getEnd = () => {
            return ' END'
        }
    },
});

@Register('modelExtra')
export class ObjModelExtraController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : Config.single({
            properties : {
                firstName : {
                    type : ValidationType.STRING,
                    convert : (v : string) => v.toUpperCase()
                },
                lastName : {
                    type : ValidationType.STRING
                },
                split : {
                    type : ValidationType.STRING,
                    isOptional : true,
                    default : '.'
                }
            },
            prototype : {
                greeting : 'Hello '
            },
            construct : function () {
                this.getFullName = () => {
                    return this.greeting + this.firstName + this.split + this.lastName + this.getEnd();
                }
            },
            extends : 'SomeObj'
        })
    };

    async handle(bag : RequestBag,obj) {
        return obj.getFullName();
    }
}