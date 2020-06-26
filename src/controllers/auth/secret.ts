import {Controller, ControllerConfig, Register, $userId, $not, $tokenPayloadIncludes} from 'zation-server';

@Register()
export class SecretForUserController extends Controller
{
    static config : ControllerConfig = {
        access : 'user',
        input : {}
    };

    async handle(_,{msg}) {
       return 0;
    }
}

@Register()
export class SecretForId10Controller extends Controller
{
    static config : ControllerConfig = {
        access : $userId(10),
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}


@Register()
export class SecretForAdminOrId10Controller extends Controller
{
    static config : ControllerConfig = {
        access : ['admin',$userId(10)],
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForAdminOrId11Controller extends Controller
{
    static config : ControllerConfig = {
        access : ['admin',$userId(11)],
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForUserAndId10Controller extends Controller
{
    static config : ControllerConfig = {
        access : [['user',$userId(10)]],
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForUserAndId11Controller extends Controller
{
    static config : ControllerConfig = {
        access : [['user',$userId(11)]],
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForAdminOrUserController extends Controller
{
    static config : ControllerConfig = {
        access : ['admin','user'],
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForAllExceptAdminOrUserController extends Controller
{
    static config : ControllerConfig = {
        access : $not(['admin','user']),
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForAuthController extends Controller
{
    static config : ControllerConfig = {
        access : (token) => {
            return token !== null;
        },
        input : {}
    };

    async handle(_,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForEmailController extends Controller
{
    static config : ControllerConfig = {
        access : $tokenPayloadIncludes({email: 'mytest@gmail.de'}),
        input : {}
    };

    async handle(_g,{msg}) {
        return 0;
    }
}