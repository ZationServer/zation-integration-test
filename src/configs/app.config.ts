/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Config}          from 'zation-server';

import "../api/controllers/auth/logIn.ts";
import "../api/controllers/auth/secret.ts";
import "../api/controllers/validation/canBeNull.ts";
import "../api/controllers/validation/stringValidation.ts";
import "../api/controllers/validation/anyOfValidation.ts";
import "../api/controllers/validation/objectValidation.ts";
import "../api/controllers/validation/objectClassValidation.ts";
import "../api/controllers/validation/tupleObjectValidation.ts";
import "../api/controllers/validation/arrayValidation.ts";
import "../api/controllers/validation/allAllow.ts";
import "../api/controllers/validation/nothingAllowed.ts";
import "../api/controllers/apiLevel/apiLevel.ts";
import "../api/controllers/timeout/timeout.ts";
import "../api/controllers/validation/complexValidation.ts";
import "../api/controllers/validation/extendValueModel.ts";
import "../api/controllers/modelExtra/modelExtra.ts";
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