import {Controller, ControllerConfig, Result, RequestBag, Register, $userId, $not} from 'zation-server';

@Register()
export class SecretForUserController extends Controller
{
    static config : ControllerConfig = {
        access : 'user',
        input : {}
    };

    async handle(bag : RequestBag,{msg}) {
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

    async handle(bag : RequestBag,{msg}) {
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

    async handle(bag : RequestBag,{msg}) {
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

    async handle(bag : RequestBag,{msg}) {
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

    async handle(bag : RequestBag,{msg}) {
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

    async handle(bag : RequestBag,{msg}) {
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

    async handle(bag : RequestBag,{msg}) {
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

    async handle(bag : RequestBag,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForAuthController extends Controller
{
    static config : ControllerConfig = {
        access : (smallBag, token) => {
            return token !== null;
        },
        input : {}
    };

    async handle(bag : RequestBag,{msg}) {
        return 0;
    }
}

@Register()
export class SecretForEmailController extends Controller
{
    static config : ControllerConfig = {
        access : (smallBag, token) => {
            if(token !== null){
                return token.getTokenVariable('email') === 'mytest@gmail.de';
            }
            return false;
        },
        input : {}
    };

    async handle(bag : RequestBag,{msg}) {
        return 0;
    }
}