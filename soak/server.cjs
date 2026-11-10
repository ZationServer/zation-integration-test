/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/*
A server of the soak run, started as its own process.
The data lives in a JSON file that the run writes before it lets a server emit the change.
  PORT, NAME, DB (file), JOIN (cluster), BROKER_PROXIES ({"brokerPort": proxyPort}),
  UNREGISTER_DELAY, HISTORY_LENGTH, HISTORY_BUDGET (databoxHistoryBudget of the server),
  CLOCK_SKEW_MS (the clock of this server runs ahead or behind)
*/

const skew = Number(process.env.CLOCK_SKEW_MS || 0);
if(skew !== 0) {
    const now = Date.now;
    Date.now = () => now() + skew;
}

const fs = require('fs');
const path = require('path');

const serverModule = process.env.SERVER_MODULE || 'zation-server';

//the broker connections of this server go through its own proxies (the run cuts or delays them)
const proxies = JSON.parse(process.env.BROKER_PROXIES || '{}');
if(Object.keys(proxies).length > 0) {
    const worker = require(require.resolve('ziron-worker', {paths: [path.dirname(require.resolve(serverModule))]}));
    const build = worker.BrokerClientPool.prototype._buildSocketOptions;
    worker.BrokerClientPool.prototype._buildSocketOptions = function () {
        const options = build.call(this);
        const target = proxies[String(options.port)];
        if(target !== undefined) {
            options.hostname = '127.0.0.1';
            options.port = target;
        }
        return options;
    };
}

const zation = require(serverModule);
const {API, Config, Controller, Databox, Router, StaticDatabox} = zation;

const DB = process.env.DB;
const read = () => JSON.parse(fs.readFileSync(DB, 'utf8'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* Delays a fetch after it read the data. */
let fetchDelay = 0;
const delayed = async (value) => {
    if(fetchDelay > 0) await sleep(fetchDelay);
    return value;
};

const dbConfig = {access: 'all', unregisterDelay: Number(process.env.UNREGISTER_DELAY || 3000)};
if(process.env.HISTORY_LENGTH !== undefined) dbConfig.historyLength = Number(process.env.HISTORY_LENGTH);

/* Keyed values per member, changed by set and delete with the timestamp of the run (its order). */
class Items extends Databox {}
Items.prototype.singleFetch = function (_request, connection) {
    return delayed(read().items[connection.member] || {});
};
Databox.Config(dbConfig)(Items);
API('items')(Items);

/* Changed by content().sync only, from several servers. */
class Synced extends Databox {}
Synced.prototype.singleFetch = function (_request, connection) {
    return delayed(read().synced[connection.member] || {});
};
Databox.Config(dbConfig)(Synced);
API('synced')(Synced);

/* Static, lives through all episodes. */
class Board extends StaticDatabox {}
Board.prototype.singleFetch = function () {
    return delayed(read().board);
};
StaticDatabox.Config(dbConfig)(Board);
API('board')(Board);

/* To see whether the servers get the transactions of each other. */
class Probe extends StaticDatabox {}
Probe.prototype.singleFetch = function () {
    return read().probe;
};
StaticDatabox.Config({access: 'all'})(Probe);
API('probe')(Probe);

const databoxes = {items: Items, synced: Synced, board: Board, probe: Probe};
const instances = {};
for(const name in databoxes) databoxes[name].prototype.initialize = function () {instances[name] = this;};

/*
Emits a change after the run wrote it to the file.
ops: [type, key, value] with type set or delete, all with the timestamp;
sync: the new value for content().sync (read from the file when true); reload: forceReload; unknown: anyContentChange.
*/
class Emit extends Controller {
    handle(_socket, {box, member, ops, timestamp, sync, reload, unknown}) {
        const databox = instances[box];
        const args = member !== undefined ? [member] : [];
        if(ops) {
            const transaction = databox.buildTransaction(...args);
            for(const [type, key, value] of ops) {
                if(type === 'set') transaction.update([key], value, {potentialInsert: true});
                else transaction.delete([key]);
            }
            transaction.commit({timestamp});
        }
        if(sync !== undefined) databox.content(...args).sync(sync === true ? read()[box][member] : sync);
        if(reload) databox.forceReload(...args);
        if(unknown) databox.anyContentChange(...args);
        return true;
    }
}
Controller.Config({access: 'all', input: 'any'})(Emit);
API('emit')(Emit);

class Control extends Controller {
    handle(_socket, input) {
        if(input && input.fetchDelay !== undefined) fetchDelay = input.fetchDelay;
        return {name: process.env.NAME};
    }
}
Controller.Config({access: 'all', input: 'any'})(Control);
API('control')(Control);

const root = new Router();
for(const component of [Items, Synced, Board, Probe, Emit, Control]) root.use(component);
root.register();

Config.serverConfig({
    port: Number(process.env.PORT),
    path: '/zation',
    panel: {active: false},
    logLevel: 0,
    ...(process.env.JOIN ? {join: process.env.JOIN} : {}),
    ...(process.env.HISTORY_BUDGET ? {databoxHistoryBudget: Number(process.env.HISTORY_BUDGET)} : {})
}).register();
Config.appConfig({appName: 'Soak'}).register();

zation.default().then(() => console.log('ready'), (err) => {
    console.error(err);
    process.exit(1);
});
