import {Config}          from 'zation-server';
import {LogInController} from "../controllers/auth/logIn";
import {SendMsgToAllController} from "../controllers/sendMsgToAll";
import {SecretForUserController} from "../controllers/secretForUser";
import {StringValidationController} from "../controllers/stringValidation";
import {AnyOfValidationController} from "../controllers/anyOfValidation";
import {ObjectValidationController} from "../controllers/objectValidation";
import {ArrayValidationController} from "../controllers/arrayValidation";

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
                sendMsgToAll : SendMsgToAllController,
                secretForUser : SecretForUserController,
                stringValidation : StringValidationController,
                anyOfValidation : AnyOfValidationController,
                objectValidation : ObjectValidationController,
                arrayValidation : ArrayValidationController
            }
    });