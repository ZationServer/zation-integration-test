/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Databox, DbInConnection, FetchRequest, Register} from "zation-server";

interface Counter {
    value: number;
}

/**
 * The current value of each counter (the member is the name of the counter).
 * It is updated by the CountUpReceiver.
 */
export const counterValues: Record<string, number> = {};

@Register()
@Databox.Config({
    access: 'all'
})
export class CounterDatabox extends Databox<Counter>
{
    protected async singleFetch(request: FetchRequest, connection: DbInConnection<string>) {
        return {value: counterValues[connection.member] ?? 0};
    }
}
