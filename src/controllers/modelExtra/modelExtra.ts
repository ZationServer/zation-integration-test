import {
    Config,
    Controller,
    ControllerConfig,
    Register,
    $model,
    $single, $extends, $optional
} from 'zation-server';

const someObj = $model({
    properties : {
    },
    construct: function () {
        this.getEnd = () => {
            return ' END'
        }
    },
});

@Register({name: 'modelExtra'})
export class ObjModelExtraController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : $single($extends({
            properties : {
                firstName : {
                    type : 'string',
                    convert : (v : string) => v.toUpperCase()
                },
                lastName : {
                    type : 'string'
                },
                split : $optional({
                    type : 'string'
                },'.')
            },
            prototype : {
                greeting : 'Hello '
            },
            construct : function () {
                this.getFullName = () => {
                    return this.greeting + this.firstName + this.split + this.lastName + this.getEnd();
                }
            }
        },someObj))
    };

    async handle(_,obj) {
        return obj.getFullName();
    }
}