import {Bag, Config, Controller, ControllerConfig, Register, Result, ValidationTypes} from 'zation-server';

@Register('result')
export class ComplexValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                statusCode : {},
                result : {}
            }
    };

    async handle(bag: Bag, {statusCode,result}): Promise<any> {
        return new Result(result,statusCode);
    }
}