/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/*
A server of the resume tests, started as its own process.
The data lives in a JSON file that the test writes before it lets a server emit the change.
  PORT, NAME, DB (file), JOIN (cluster), SERVER_MODULE (zation-server or zation-server-v0),
  HISTORY_LENGTH, HISTORY_BUDGET (databoxHistoryBudget of the server), UNREGISTER_DELAY
*/

const fs = require('fs');
const zation = require(process.env.SERVER_MODULE || 'zation-server');
const {API, Config, Controller, Databox, Router, StaticDatabox} = zation;

const DB = process.env.DB;
const read = () => JSON.parse(fs.readFileSync(DB, 'utf8'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* Delays a fetch after it read the data: changes can come before the socket is registered. */
let fetchDelay = 0;
/* Fetches since the start, to see whether clients fetch by themselves. */
let fetches = 0;

const dbConfig = {access: 'all', unregisterDelay: Number(process.env.UNREGISTER_DELAY || 120000)};
if(process.env.HISTORY_LENGTH !== undefined) dbConfig.historyLength = Number(process.env.HISTORY_LENGTH);

const fetchFrom = (key) => async function () {
    fetches++;
    const value = read()[key];
    if(fetchDelay > 0) await sleep(fetchDelay);
    return value;
};

class Box extends StaticDatabox {}
Box.prototype.singleFetch = fetchFrom('box');
StaticDatabox.Config(dbConfig)(Box);
API('box')(Box);

class SyncBox extends StaticDatabox {}
SyncBox.prototype.singleFetch = fetchFrom('syncBox');
StaticDatabox.Config(dbConfig)(SyncBox);
API('syncBox')(SyncBox);

/* Transactions pass a middleware: missed ones can not be replayed per socket. */
class Filtered extends StaticDatabox {
    transactionMiddleware() {}
}
Filtered.prototype.singleFetch = fetchFrom('filtered');
StaticDatabox.Config(dbConfig)(Filtered);
API('filtered')(Filtered);

class Room extends Databox {}
Room.prototype.singleFetch = async function (request, connection) {
    fetches++;
    const value = read().rooms[connection.member];
    if(fetchDelay > 0) await sleep(fetchDelay);
    return value;
};
Databox.Config(dbConfig)(Room);
API('room')(Room);

const databoxes = {box: Box, syncBox: SyncBox, filtered: Filtered, room: Room};

/*
Emits a change after the test wrote it to the file.
ops: [type, path, value] with type insert, update or delete; sync: the new value for content().sync;
reload: forceReload; unknown: anyContentChange.
*/
class Emit extends Controller {
    handle(_socket, {box, member, ops, sync, reload, unknown}) {
        const databox = Emit.instances[box];
        const args = member !== undefined ? [member] : [];
        if(ops) {
            const bundle = databox.content(...args, true);
            for(const [type, path, value] of ops) {
                let target = bundle;
                for(let i = 0; i < path.length - 1; i++) target = target[path[i]];
                const key = path[path.length - 1];
                if(type === 'insert') target.insert(key, value);
                else if(type === 'update') target[key].update(value);
                else target[key].delete();
            }
            bundle.commit();
        }
        if(sync !== undefined) databox.content(...args).sync(sync);
        if(reload) databox.forceReload(...args);
        if(unknown) databox.anyContentChange(...args);
        return true;
    }
}
Emit.instances = {};
Controller.Config({access: 'all', input: 'any'})(Emit);
API('emit')(Emit);

class Control extends Controller {
    handle(_socket, input) {
        if(input && input.fetchDelay !== undefined) fetchDelay = input.fetchDelay;
        return {fetches, name: process.env.NAME};
    }
}
Controller.Config({access: 'all', input: 'any'})(Control);
API('control')(Control);

for(const name in databoxes) databoxes[name].prototype.initialize = function () {Emit.instances[name] = this;};

const root = new Router();
for(const component of [Box, SyncBox, Filtered, Room, Emit, Control]) root.use(component);
root.register();

Config.serverConfig({
    port: Number(process.env.PORT),
    path: '/zation',
    panel: {active: false},
    logLevel: 0,
    ...(process.env.JOIN ? {join: process.env.JOIN} : {}),
    ...(process.env.HISTORY_BUDGET ? {databoxHistoryBudget: Number(process.env.HISTORY_BUDGET)} : {})
}).register();
Config.appConfig({appName: 'Resume'}).register();

zation.default().then(() => console.log('ready'), (err) => {
    console.error(err);
    process.exit(1);
});
