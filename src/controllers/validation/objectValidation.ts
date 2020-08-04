import {Controller, Register} from 'zation-server';

@Controller.Config({
    access : 'all',
    input : {
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
})
@Register()
export class ObjectValidationController extends Controller {}