import {Controller, ControllerConfig, Register} from 'zation-server';

@Register()
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

@Register()
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

@Register()
export class SystemAccessController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        systemAccess : ['T']
    };
}