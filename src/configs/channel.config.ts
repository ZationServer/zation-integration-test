import {Config} from 'zation-server';

module.exports = Config.channelConfig(
    {
        customChannels :
            {
                default : {
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
                }
            },

        customIdChannels :
            {
                default : {
                    clientPublishAccess : false,
                    subscribeAccess : true,
                },
                idCheck : {
                    idCheck : (id) => {
                        return id === 'm2';
                    }
                }
            },
    });