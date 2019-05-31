import {Config}          from 'zation-server';
import "../controllers/auth/logIn";
import "../controllers/sendMsgToAll";
import "../controllers/secretForUser";
import "../controllers/stringValidation";
import "../controllers/anyOfValidation";
import "../controllers/objectValidation";
import "../controllers/arrayValidation";
import "../controllers/singleInputValidation";
import "../controllers/versionSystemAccess";

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
    });