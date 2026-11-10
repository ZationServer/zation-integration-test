/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Inject, Receiver, Register, Socket} from "zation-server";
import {CounterDatabox, counterValues} from "../databoxes/counter";

@Register()
@Receiver.Config({
    access: 'all',
    input: {type: 'string'}
})
export class CountUpReceiver extends Receiver
{
    @Inject(CounterDatabox)
    private readonly counterDatabox: CounterDatabox;

    handle(socket: Socket, counter: string) {
        const value = (counterValues[counter] ?? 0) + 1;
        counterValues[counter] = value;
        this.counterDatabox.content(counter).value.update(value);
    }
}
