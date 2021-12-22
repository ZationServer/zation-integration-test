/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Databox, DbInConnection, FetchRequest, Register} from "zation-server";

interface UserProfile {
    name: string;
    age: number;
}

@Register()
@Databox.Config({
    access: 'all'
})
export class UserProfileDatabox extends Databox<UserProfile>
{
    protected async singleFetch(request: FetchRequest, connection: DbInConnection<string>) {
        return {
            name: "Elon",
            age: 22
        }
    }
}
