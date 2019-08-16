import {Controller, ControllerConfig, Result, RequestBag, Register} from 'zation-server';

@Register('secretForUser')
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

@Register('secretForId10')
export class SecretForId10Controller extends Controller
{
    static config : ControllerConfig = {
        access : 10,
        input : {}
    };

    async handle(bag : RequestBag,{msg}) {
        return 0;
    }
}

@Register('secretForAdminOrUser')
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

@Register('secretForAuth')
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

@Register('secretForEmail')
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