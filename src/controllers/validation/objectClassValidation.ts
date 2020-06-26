import {
    Controller,
    ControllerConfig,
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

    constructor() {
        super();
    }

    @Model({type : 'number',minValue : 3,maxValue : 10})
    screenSize : number;

    @Model({type : 'string'})
    producer : string;

    getDeviceCode() {
        return this.producer + '-' + (this as any).deviceId;
    }
}

@Register()
export class ObjectClassValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : Phone
    };

    async handle(_, phone: Phone): Promise<any> {
        return phone.getDeviceCode();
    }
}