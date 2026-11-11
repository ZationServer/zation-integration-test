/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Receiver, Register, Socket} from "zation-server";

/**
 * Closes the connection of the caller with the code: a lost connection
 * that the client reconnects by its clock (codes below 4500 except 1000).
 */
@Register()
@Receiver.Config({
    access: 'all',
    input: {type: 'number'}
})
export class DropConnectionReceiver extends Receiver
{
    handle(socket: Socket, code: number) {
        socket.disconnect(code,'Dropped by the test');
    }
}
