/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Inject, Receiver, Register, Socket} from "zation-server";
import {UserProfileDatabox} from "../databoxes/userProfile";

@Register()
@Receiver.Config({
    access: 'all',
    input: {type: 'number'}
})
export class UpdateUserAgeReceiver extends Receiver
{
    @Inject(UserProfileDatabox)
    private readonly userProfileDatabox: UserProfileDatabox;

    handle(socket: Socket, input: number) {
        this.userProfileDatabox.content('1').age.update(input);
    }

}
