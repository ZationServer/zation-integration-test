/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Channel, Register, StaticChannel} from "zation-server";

@Register()
@Channel.Config({
    access: 'all'
})
export class NewsChannel extends StaticChannel
{}
