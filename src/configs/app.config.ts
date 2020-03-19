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
import "../controllers/validation/extendValueModel";
import "../controllers/result/result";
import "../controllers/modelExtra/modelExtra";

export default Config.appConfig(
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

        customChannelDefaults : {
            clientPublishAccess : false,
            subscribeAccess : true,
        },

        customChannels : {
            defaultTest1 : {
                subscribeAccess : (smallBag, socketInfo) => {
                    return !socketInfo.isAuth;
                }
            },
            defaultTest2 : {
                subscribeAccess : 'allNotAuth'
            },
            authTest1 : {
                subscribeAccess : (smallBag, socketInfo) => {
                    return socketInfo.isAuth;
                }
            },
            authTest2 : {
                subscribeAccess : 'allAuth'
            },
            syAccessWT : {
                systemAccess : ['W','T']
            },
            syAccessW : {
                systemAccess : ['W']
            },
            vAccessValid1 : {
                versionAccess : {
                    'T' : 4.0
                }
            },
            vAccessValid2 : {
                versionAccess : {
                    'T' : [2.0,4.5]
                }
            },
            vAccessNotValid : {
                versionAccess : {
                    'T' : [5.0,1.0]
                }
            },
            idCheck : [{
                idValid : (id) => {
                    return id === 'm2';
                }
            }]
        }

    });