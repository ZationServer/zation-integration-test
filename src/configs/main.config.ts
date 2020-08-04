import {Config} from 'zation-server';

export default Config.mainConfig(
    {
        port: 3000,
        appName : 'zation-integration-test',
        panel: {
           active: true,
           user: {username: 'admin', password: '1234'}
        },
        defaultClientApiLevel : 3,
    });