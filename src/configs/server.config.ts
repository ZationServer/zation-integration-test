/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Config} from 'zation-server';

export default Config.serverConfig(
    {
        port: 3000,
        panel: {
           active: true,
           user: {username: 'admin', password: '1234'}
        },
        defaultClientApiLevel: 3
    }).register();