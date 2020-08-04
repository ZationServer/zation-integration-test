import {Config}          from 'zation-server';

import "../controllers/auth/logIn";
import "../controllers/pubSub/sendMsgToAll";
import "../controllers/auth/secret";
import "../controllers/validation/canBeNull";
import "../controllers/validation/stringValidation";
import "../controllers/validation/anyOfValidation";
import "../controllers/validation/objectValidation";
import "../controllers/validation/objectClassValidation";
import "../controllers/validation/tupleObjectValidation";
import "../controllers/validation/arrayValidation";
import "../controllers/validation/allAllow";
import "../controllers/validation/nothingAllow";
import "../controllers/versionSystemAccess/versionSystemAccess";
import "../controllers/apiLevel/apiLevel";
import "../controllers/timeout/timeout";
import "../controllers/validation/complexValidation";
import "../controllers/validation/extendValueModel";
import "../controllers/modelExtra/modelExtra";

export default Config.appConfig(
    {
        userGroups: {
            auth: {
                admin: {},
                user: {},
            },
            default: 'guest'
        },

        controllerDefaults: {
            access: 'all',
        }
    });