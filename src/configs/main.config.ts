import {Config} from 'zation-server';

export default Config.mainConfig(
    {
        port: 3000,
        appName : 'zation-integration-test',
        usePanel : true,
        panelUser : {username: 'admin', password: '1234'},
        defaultClientApiLevel : 3,
    });