import {Config, Controller, ControllerConfig, Register, ValidationType} from 'zation-server';

Config.defineModel('MinString',{
    type : ValidationType.STRING,
    minLength : 2,
});

Config.defineModel('animal',{
   properties : {
       name : {
           extends : 'MinString',
           maxLength : 10,
           startsWith : 'T'
       }
   }
});

Config.defineModel('person',{
    properties : {
        name : {
            maxLength : 20,
            minLength : 0,
            type : 'string'
        },
        age : {
            type :ValidationType.NUMBER,
            maxValue : 100,
            minValue : 10
        }
    }
});

@Register('complexValidation')
export class ComplexValidationController extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        input :
            {
               animal : {
                   anyOf : {
                       dog : {
                           properties : {
                               likeToBark : {
                                   type : ValidationType.BOOLEAN
                               }
                           },
                           extends : 'animal'
                       },
                       cat : {
                           properties : {
                           },
                           extends : 'animal'
                       }
                   }
               },
               persons : ['person',{minLength : 2,maxLength : 10}],
               properties : {isOptional : true}
            }
    };
}