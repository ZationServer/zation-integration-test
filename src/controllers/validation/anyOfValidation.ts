import {Controller, Register} from 'zation-server';

@Controller.Config({
    access : 'all',
    input : {
        anyOf : {
            id : {
                type : 'int'
            },
            email : {
                type : 'email'
            }
        }
    }
})
@Register()
export class AnyOfValidationController extends Controller {}