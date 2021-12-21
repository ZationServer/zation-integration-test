/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {
    Controller,
    Register,
    ObjectModel,
    Model
} from 'zation-server';

@ObjectModel()
class Device {

    @Model({type : 'int'})
    deviceId : number
}

@ObjectModel()
class Phone extends Device {

    @Model({type : 'number',minValue : 3,maxValue : 10})
    screenSize : number;

    @Model({type : 'string'})
    producer : string;

    getDeviceCode() {
        return this.producer + '-' + (this as any).deviceId;
    }
}

@Controller.Config({
    access: 'all',
    input: Phone
})
@Register()
export class ObjectClassValidationController extends Controller
{
    async handle(_, phone: Phone): Promise<any> {
        return phone.getDeviceCode();
    }
}