import {
    Controller,
    ControllerConfig,
    Register,
    ObjectModel,
    Model,
    Config
} from 'zation-server';

@Register()
export class ApiLevelController_5 extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle(_) {
        return 5;
    }
}

@Register()
export class ApiLevelController_2 extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle() {
        return 2;
    }
}