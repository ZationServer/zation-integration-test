import {Config}          from 'zation-server';
import {LogInController} from "../controllers/auth/logIn";
import {SendMsgToAllController} from "../controllers/sendMsgToAll";

module.exports = Config.appConfig(
    {
        userGroups :
            {
                auth : {
                    admin : {},
                    user : {},
                },
                default : 'guest'
            },

        controllerDefaults :
            {
                wsAccess : true,
                httpAccess : true,
                httpPostAllowed : true,
                httpGetAllowed : true,
                access : 'all',
            },

        authController : 'logIn',

        controllers :
            {
                logIn : LogInController,
                sendMsgToAll : SendMsgToAllController
            }
    });