import {Controller, ControllerConfig, Register, $userId, $not, $tokenPayloadMatches, $and} from 'zation-server';

@Register()
export class SecretForUserController extends Controller
{
    static config : ControllerConfig = {
        access : 'user'
    };

    async handle() {
       return 0;
    }
}

@Register()
export class SecretForId10Controller extends Controller
{
    static config : ControllerConfig = {
        access : $userId(10)
    };

    async handle() {
        return 0;
    }
}


@Register()
export class SecretForAdminOrId10Controller extends Controller
{
    static config : ControllerConfig = {
        access : ['admin',$userId(10)]
    };

    async handle() {
        return 0;
    }
}

@Register()
export class SecretForAdminOrId11Controller extends Controller
{
    static config : ControllerConfig = {
        access : ['admin',$userId(11)]
    };

    async handle() {
        return 0;
    }
}

@Register()
export class SecretForUserAndId10Controller extends Controller
{
    static config : ControllerConfig = {
        access : [['user',$userId(10)]]
    };

    async handle() {
        return 0;
    }
}

@Register()
export class SecretForUserAndId11Controller extends Controller
{
    static config : ControllerConfig = {
        access : $and('user',$userId(11))
    };

    async handle() {
        return 0;
    }
}

@Register()
export class SecretForAdminOrUserController extends Controller
{
    static config : ControllerConfig = {
        access : ['admin','user']
    };

    async handle() {
        return 0;
    }
}

@Register()
export class SecretForAllExceptAdminOrUserController extends Controller
{
    static config : ControllerConfig = {
        access : $not(['admin','user'])
    };

    async handle() {
        return 0;
    }
}

@Register()
export class SecretForAuthController extends Controller
{
    static config : ControllerConfig = {
        access : (socket) => {
            return socket.isAuthenticated()
        }
    };

    async handle() {
        return 0;
    }
}

@Register()
export class SecretForEmailController extends Controller
{
    static config : ControllerConfig = {
        access : $tokenPayloadMatches({email: 'mytest@gmail.de'})
    };

    async handle() {
        return 0;
    }
}