import {
    Controller,
    ControllerConfig,
    Result,
    Bag,
    SmallBag,
    Register,
    ObjectModel,
    Extends,
    Model
} from 'zation-server';

@ObjectModel()
@Extends({
    properties : {
        deviceId : {
            type : 'int'
        }
    },

})
class Phone {

    constructor()
    {
        console.log('test');
    }

    @Model({type : 'number',minValue : 3,maxValue : 10})
    screenSize : number;

    @Model({type : 'string'})
    producer : string;

    getDeviceCode() {
        return this.producer + '-' + (this as any).deviceId;
    }
}

@Register('objectClassValidation')
export class ObjectValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input : Phone
    };

    async handle(bag: Bag, phone: Phone): Promise<any> {
        console.log((phone as any).__proto__);
        console.log(typeof  phone.getDeviceCode);
        return phone.getDeviceCode();
    }
}