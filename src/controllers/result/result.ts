import {RequestBag, Config, Controller, ControllerConfig, Register, Result, ValidationTypes} from 'zation-server';

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

    async handle(bag: RequestBag, {statusCode,result}): Promise<any> {
        return new Result(result,statusCode);
    }
}