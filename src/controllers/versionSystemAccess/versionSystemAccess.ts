import {Controller, ControllerConfig, Result, Bag, SmallBag, Register} from 'zation-server';

@Register('versionAccessMin')
export class VersionAccessMinController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        versionAccess : {
            T : 2.0,
            A : 8.0
        }

    };
}

@Register('versionAccessExact')
export class VersionAccessExactController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        versionAccess : {
            T : [2.3,4.0,1.3],
            A : [5.6,1.3,0.4,2.4]
        }

    };
}

@Register('systemAccess')
export class SystemAccessController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        systemAccess : ['T']
    };
}