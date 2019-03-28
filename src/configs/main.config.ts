import {Config} from 'zation-server';

module.exports = Config.mainConfig(
    {
        port: 3000,
        appName : 'zation-integration-test',
        usePanel : true,
        panelUser : {username: 'admin', password: '1234'},
    });