import "./configs/app.config";
import "./configs/server.config";
import {Config, start} from 'zation-server';

start(Config.configurations);