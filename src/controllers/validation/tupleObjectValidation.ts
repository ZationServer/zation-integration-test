import {Controller, Register} from 'zation-server';

@Controller.Config({
    access : 'all',
    input: {
        properties: {
            0: {type: 'string'},
            1: {type: 'number'},
            2: {type: 'string'},
        }
    }
})
@Register()
export class TupleObjectValidationController extends Controller {}