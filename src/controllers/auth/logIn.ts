import {Controller, Register, AuthController} from 'zation-server';

@Controller.Config({
    access : 'all',
    input : {
        properties: {
            email : {
                type : 'email',
            },
            password : {
                type : 'string',
                minLength : 3
            },
        }
    }
})
@Register()
export class LogInController extends AuthController
{
    async handle(socket,{email,password}) {
        await socket.authenticate('user',10,{email : email});
    }
}