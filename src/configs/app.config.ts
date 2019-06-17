import {Config}          from 'zation-server';

import "../controllers/auth/logIn";
import "../controllers/pubSub/sendMsgToAll";
import "../controllers/auth/secret";
import "../controllers/validation/stringValidation";
import "../controllers/validation/anyOfValidation";
import "../controllers/validation/objectValidation";
import "../controllers/validation/objectClassValidation";
import "../controllers/validation/arrayValidation";
import "../controllers/validation/singleInputValidation";
import "../controllers/validation/allAllow";
import "../controllers/versionSystemAccess/versionSystemAccess";
import "../controllers/apiLevel/apiLevel";
import "../controllers/timeout/timeout";
import "../controllers/validation/complexValidation";
import "../controllers/result/result";
import "../controllers/modelExtra/modelExtra";

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