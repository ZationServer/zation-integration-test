import {
    Controller,
    Register,
    $model,
    $extends, $optional
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

@Controller.Config({
    access : 'all',
    input : $extends({
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
    },someObj)
})
@Register()
export class ObjModelExtraController extends Controller
{
    async handle(_,obj) {
        return obj.getFullName();
    }
}