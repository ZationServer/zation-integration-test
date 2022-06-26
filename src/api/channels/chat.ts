/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Channel, Register} from "zation-server";

@Register()
@Channel.Config({
    access: 'all'
})
export class ChatChannel extends Channel
{}
