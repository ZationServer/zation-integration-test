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

/**
 * The current state of the user profile with the member id '1'.
 * It is updated by the UpdateUserAgeReceiver so that a reload
 * (e.g. after a reconnect) returns the current data.
 */
export const userProfileState: UserProfile = {
    name: "Elon",
    age: 22
};

@Register()
@Databox.Config({
    access: 'all'
})
export class UserProfileDatabox extends Databox<UserProfile>
{
    protected async singleFetch(request: FetchRequest, connection: DbInConnection<string>) {
        return {...userProfileState};
    }
}
