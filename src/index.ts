/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import "./configs/app.config";
import "./configs/server.config";
import {Config, start} from 'zation-server';

start(Config.configurations);