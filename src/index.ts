/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import "./configs/app.config";
import "./configs/server.config";
import launch, {Config} from 'zation-server';

launch(Config.configurations);