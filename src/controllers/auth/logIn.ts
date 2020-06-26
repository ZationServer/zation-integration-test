import {Controller, ControllerConfig, Register, AuthController} from 'zation-server';

@Register()
export class LogInController extends AuthController
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
                email :
                    {
                        type : 'email',
                    },
                password :
                    {
                        type : 'string',
                        minLength : 3
                    },
            }
    };

    async handle(socket,{email,password}) {
        await socket.authenticate('user',10,{email : email});
    }
}