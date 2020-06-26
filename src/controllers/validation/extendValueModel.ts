import {
    Controller,
    ControllerConfig,
    Register,
    $single,
    $extends,
    $optional,
    bag, Bag, $model
} from 'zation-server';


const name = $extends($model({
    type: 'string'
}),{minLength: 5});

@Register()
export class ExtendValueModelSingleController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input: $single($optional(name))
    };

    async handle(_, input: any): Promise<any> {
        return input;
    }
}

@Register()
export class ExtendValueModelParamController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input: {
            data: $optional(name)
        }
    };

    async handle(_, input: any): Promise<any> {
        return input.data;
    }
}