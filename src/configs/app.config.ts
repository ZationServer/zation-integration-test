/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Config}          from 'zation-server';

import "../controllers/auth/logIn.ts";
import "../controllers/auth/secret.ts";
import "../controllers/validation/canBeNull.ts";
import "../controllers/validation/stringValidation.ts";
import "../controllers/validation/anyOfValidation.ts";
import "../controllers/validation/objectValidation.ts";
import "../controllers/validation/objectClassValidation.ts";
import "../controllers/validation/tupleObjectValidation.ts";
import "../controllers/validation/arrayValidation.ts";
import "../controllers/validation/allAllow.ts";
import "../controllers/validation/nothingAllowed.ts";
import "../controllers/apiLevel/apiLevel.ts";
import "../controllers/timeout/timeout.ts";
import "../controllers/validation/complexValidation.ts";
import "../controllers/validation/extendValueModel.ts";
import "../controllers/modelExtra/modelExtra.ts";

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