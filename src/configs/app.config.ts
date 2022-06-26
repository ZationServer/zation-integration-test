/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Config} from 'zation-server';

import "../api/controllers/auth/logIn";
import "../api/controllers/auth/secret";
import "../api/controllers/validation/canBeNull";
import "../api/controllers/validation/stringValidation";
import "../api/controllers/validation/anyOfValidation";
import "../api/controllers/validation/objectValidation";
import "../api/controllers/validation/objectClassValidation";
import "../api/controllers/validation/tupleObjectValidation";
import "../api/controllers/validation/arrayValidation";
import "../api/controllers/validation/allAllow";
import "../api/controllers/validation/nothingAllowed";
import "../api/controllers/apiLevel/apiLevel";
import "../api/controllers/timeout/timeout";
import "../api/controllers/validation/complexValidation";
import "../api/controllers/validation/extendValueModel";
import "../api/controllers/modelExtra/modelExtra";
import "../api/channels/chat";
import "../api/channels/news";
import "../api/receivers/publishMessage";
import "../api/receivers/publishNews";
import "../api/receivers/updateUserAge";
import "../api/receivers/deleteProduct";
import "../api/receivers/addProduct";
import "../api/databoxes/userProfile";
import "../api/databoxes/products";

Config.appConfig(
    {
        appName : 'zation-integration-test',
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
    }).register();