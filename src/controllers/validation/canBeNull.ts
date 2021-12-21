/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {$canBeNull, Controller, Register} from "zation-server";

@Controller.Config({
    access : 'all',
    input : $canBeNull({properties: {}})
})
@Register()
export class ObjectCanBeNullController extends Controller {}

@Controller.Config({
    access : 'all',
    input : $canBeNull({type: 'string'})
})
@Register()
export class ValueCanBeNullController extends Controller {}

@Controller.Config({
    access : 'all',
    input : $canBeNull([{type: 'string'}])
})
@Register()
export class ArrayCanBeNullController extends Controller {}

@Controller.Config({
    access : 'all',
    input : $canBeNull({anyOf: {name: {type: 'string'}, email: {type: 'email'}}})
})
@Register()
export class AnyOfCanBeNullController extends Controller {}

@Controller.Config({
    access : 'all',
    input : {properties: {}}
})
@Register()
export class ObjectCanNotBeNullController extends Controller {}

@Controller.Config({
    access : 'all',
    input : {type: 'string'}
})
@Register()
export class ValueCanNotBeNullController extends Controller {}

@Controller.Config({
    access : 'all',
    input : [{type: 'string'}]
})
@Register()
export class ArrayCanNotBeNullController extends Controller {}

@Controller.Config({
    access : 'all',
    input : {anyOf: {name: {type: 'string'}, email: {type: 'email'}}}
})
@Register()
export class AnyOfCanNotBeNullController extends Controller {}