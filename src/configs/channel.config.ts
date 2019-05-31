import {Config} from 'zation-server';

module.exports = Config.channelConfig(
    {
        customChannels :
            {
                default :
                    {
                        clientPublishAccess : false,
                        subscribeAccess : true,
                    },
                defaultTest1 : {
                    subscribeAccess : (smallBag, socketInfo) => {
                       return !socketInfo.isAuthIn;
                    }
                },
                defaultTest2 : {
                    subscribeAccess : 'allNotAuth'
                },
                authTest1 : {
                    subscribeAccess : (smallBag, socketInfo) => {
                        return socketInfo.isAuthIn;
                    }
                },
                authTest2 : {
                    subscribeAccess : 'allAuth'
                }
            },

        customIdChannels :
            {
                default :
                    {
                        clientPublishAccess : false,
                        subscribeAccess : true,
                    },
            },
    });