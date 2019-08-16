import {
    Controller,
    ControllerConfig,
    Result,
    RequestBag,
    Register,
    ObjectModel,
    Model,
    Extends, Config
} from 'zation-server';

@Register('apiLevel',5)
export class ApiLevel5Controller extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle(bag : RequestBag,{msg}) {
        return 5;
    }
}

@Register('apiLevel',2)
export class ApiLevel2Controller extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
    };

    async handle(bag : RequestBag,{msg}) {
        return 2;
    }
}