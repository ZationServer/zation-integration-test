/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/// <reference types="node" />
import {plain, same, sleep, SoakCluster, waitUntil} from "./cluster";

/** A small seeded random generator (mulberry32): a seed gives the same changes and faults. */
export function random(seed: number) {
    return () => {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

export interface EpisodeOptions {
    /**
     * How long the clients may take to show the source after the faults ended.
     */
    quietTimeout?: number,
    /**
     * Without faults, only changes.
     */
    faults?: boolean
}

export interface EpisodeResult {
    seed: number,
    ok: boolean,
    ms: number,
    /**
     * Time from the end of the faults until every client showed the source.
     */
    settleMs: number,
    actions: Record<string, number>,
    trace: string[],
    failure?: string
}

let clock = 0;
/** Timestamps in the order of the source (strictly increasing), not behind the clock of any server. */
const nextTimestamp = (lead: number) => clock = Math.max(clock + 1, Date.now() + lead);

/**
 * One episode: fresh members, random changes from random servers (some at the same time),
 * random faults, then a quiet phase in which every client has to reach the source.
 */
export async function runEpisode(cluster: SoakCluster, seed: number, options: EpisodeOptions = {}): Promise<EpisodeResult> {
    const start = Date.now();
    const rnd = random(seed);
    const pick = <T>(list: T[]): T => list[Math.floor(rnd() * list.length)];
    const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
    const member = 's' + seed;
    const trace: string[] = [];
    const actions: Record<string, number> = {};
    const count = (name: string) => actions[name] = (actions[name] || 0) + 1;
    const log = (line: string) => trace.push(`${Date.now() - start}ms ${line}`);
    const db = cluster.db;
    let counter = 0;

    db.items[member] = {};
    for(let i = 0; i < 4; i++) if(rnd() < 0.6) db.items[member]['k' + i] = ++counter;
    db.synced[member] = {mode: 'a', level: 0, list: ['x'], cfg: {a: 0, b: {c: 0}}};
    cluster.write();

    await Promise.all(cluster.clients.map(client => Promise.all([
        client.open('items', 'items', member),
        client.open('synced', 'synced', member),
        client.databoxes.board ? undefined : client.open('board', 'board')
    ])));

    const upServers = () => cluster.servers.filter(name => cluster.up(name));
    /** Emits at a server, at another one when that one went down meanwhile (the change is in the source already). */
    const emit = async (server: string, payload: any) => {
        for(let attempt = 0; ; attempt++) {
            try {return await cluster.emit(server, payload);}
            catch (err) {
                if(attempt > 40) throw err;
                await sleep(100);
                const up = upServers();
                if(up.length > 0) server = pick(up);
            }
        }
    };

    const keyOps = (box: string, target: Record<string, any>, prefix: string, keys: number) => {
        const ops: any[] = [];
        for(let i = 0, len = int(1, 3); i < len; i++) {
            const key = prefix + int(0, keys - 1);
            if(rnd() < 0.25) {
                ops.push(['delete', key]);
                delete target[key];
            }
            else {
                const value = rnd() < 0.2 ? {n: ++counter, tag: 't' + counter} : ++counter;
                ops.push(['set', key, value]);
                target[key] = value;
            }
        }
        return ops;
    };

    const background: Promise<any>[] = [];
    let faultError: Error | undefined;
    //a fault that fails before the end is taken at the end
    const inBackground = (promise: Promise<any>) => background.push(promise.catch(err => faultError = faultError || err));
    const steps = int(15, 40);
    const faults = options.faults !== false;
    for(let step = 0; step < steps; step++) {
        const up = upServers();
        const action = rnd();
        if(up.length === 0) {await sleep(50); continue;}
        if(action < 0.4) {
            //changes of the same member from several servers at the same time
            const parallel = int(1, 3), emits: Promise<any>[] = [];
            for(let i = 0; i < parallel; i++) {
                const server = pick(up), ops = keyOps('items', db.items[member], 'k', 6), timestamp = nextTimestamp(cluster.clockLead);
                cluster.write();
                log(`${server} items ${JSON.stringify(ops)}`);
                count('items');
                emits.push(emit(server, {box: 'items', member, ops, timestamp}));
            }
            await Promise.all(emits);
        }
        else if(action < 0.5) {
            const server = pick(up), ops = keyOps('board', db.board, 'b', 5), timestamp = nextTimestamp(cluster.clockLead);
            cluster.write();
            log(`${server} board ${JSON.stringify(ops)}`);
            count('board');
            await emit(server, {box: 'board', ops, timestamp});
        }
        else if(action < 0.62) {
            //each server reads the source when it syncs; several servers at once or one after the other without waiting
            const change = () => {
                const value = plain(db.synced[member]);
                value.level = ++counter;
                if(rnd() < 0.4) value.list = rnd() < 0.5 ? [...value.list, 'i' + counter] : value.list.slice(0, 1);
                if(rnd() < 0.2) value.mode = value.mode === 'a' ? 'b' : 'a';
                if(rnd() < 0.3) value.cfg.a = counter;
                if(rnd() < 0.2) value.cfg.b = rnd() < 0.8 ? {c: counter} : {c: counter, d: 'd' + counter};
                if(rnd() < 0.2) {
                    if(value.extra === undefined) value.extra = {n: counter};
                    else delete value.extra;
                }
                db.synced[member] = value;
                cluster.write();
                return value;
            };
            const kind = rnd(), emits: Promise<any>[] = [];
            if(kind < 0.5) {
                const server = pick(up), value = change();
                log(`${server} sync ${JSON.stringify(value)}`);
                emits.push(emit(server, {box: 'synced', member, sync: true}));
            }
            else if(kind < 0.75) {
                const value = change(), servers = up.filter(() => rnd() < 0.7);
                if(servers.length === 0) servers.push(pick(up));
                log(`${servers.join('+')} sync at once ${JSON.stringify(value)}`);
                for(const server of servers) emits.push(emit(server, {box: 'synced', member, sync: true}));
            }
            else for(let i = 0, len = int(2, 3); i < len; i++) {
                const server = pick(up), value = change();
                log(`${server} sync without waiting ${JSON.stringify(value)}`);
                emits.push(emit(server, {box: 'synced', member, sync: true}));
            }
            count('sync');
            await Promise.all(emits);
        }
        else if(action < 0.65) {
            //a change of unknown content
            const server = pick(up);
            db.items[member].k0 = ++counter;
            cluster.write();
            log(`${server} unknown k0=${counter}`);
            count('unknown');
            await emit(server, {box: 'items', member, unknown: true});
        }
        else if(action < 0.67) {
            const server = pick(up);
            log(`${server} forceReload`);
            count('reload');
            await emit(server, {box: 'items', member, reload: true});
        }
        else if(!faults) await sleep(int(0, 20));
        else if(action < 0.73) {
            const server = pick(cluster.servers), link = pick(cluster.links[server]);
            log(`drop link ${server}`);
            count('linkDrop');
            link.drop();
        }
        else if(action < 0.79) {
            //what is in flight on the link is lost
            const server = pick(cluster.servers), link = pick(cluster.links[server]), ms = int(10, 300);
            log(`cut link ${server} ${ms}ms`);
            count('linkCut');
            inBackground(link.cut(ms));
        }
        else if(action < 0.83) {
            const server = pick(cluster.servers), link = pick(cluster.links[server]), ms = int(20, 250), duration = int(200, 1500);
            log(`delay link ${server} ${ms}ms for ${duration}ms`);
            count('linkDelay');
            link.delay(ms);
            inBackground(sleep(duration).then(() => link.delay(0)));
        }
        else if(action < 0.86) {
            const server = pick(cluster.servers), duration = int(100, 1500);
            log(`link down ${server} ${duration}ms`);
            count('linkDown');
            for(const link of cluster.links[server]) link.setDown(true);
            inBackground(sleep(duration).then(() => {for(const link of cluster.links[server]) link.setDown(false);}));
        }
        else if(action < 0.88) {
            const index = int(0, cluster.brokerProcs.length - 1), pause = int(0, 600);
            if(cluster.brokerProcs[index].running) {
                log(`restart broker ${index} (${pause}ms)`);
                count('brokerRestart');
                inBackground(cluster.restartBroker(index, pause));
            }
        }
        else if(action < 0.9) {
            const server = pick(up), pause = int(0, 400);
            if(up.length > 1) {
                log(`restart server ${server} (${pause}ms)`);
                count('serverRestart');
                inBackground(cluster.restartServer(server, pause));
            }
        }
        else if(action < 0.96) {
            const client = pick(cluster.clients), to = rnd() < 0.5 ? pick(cluster.servers) : undefined;
            log(`drop client to ${to ?? client.server}`);
            count('clientDrop');
            client.drop(to);
        }
        else {
            const server = pick(up), fetchDelay = int(0, 80);
            log(`fetchDelay ${server} ${fetchDelay}`);
            count('fetchDelay');
            await cluster.control(server, {fetchDelay}).catch(() => {});
        }
        if(rnd() < 0.5) await sleep(int(0, 30));
    }

    let failure: string | undefined;
    await Promise.all(background);
    if(faultError) failure = 'A fault failed: ' + faultError.message;
    await cluster.heal();
    const healed = Date.now();
    log('healed');

    /*
    items and board show the source (their timestamps follow it). The synced data of several writers shows
    the same on every client; after one more sync of the source it is the source.
    */
    const mismatches = (syncedToSource: boolean) => {
        const list: string[] = [];
        const first = plain(cluster.clients[0].databoxes.synced?.data);
        for(const client of cluster.clients) {
            const expected: Record<string, any> = {items: db.items[member], board: db.board,
                synced: syncedToSource ? db.synced[member] : first};
            for(const key in expected) {
                const data = client.databoxes[key]?.data;
                if(!same(data, expected[key])) list.push(`${client.server}/${key}: shows ${JSON.stringify(plain(data))}, ` +
                    (key === 'synced' && !syncedToSource ? `first client ${JSON.stringify(first)}` : `source ${JSON.stringify(expected[key])}`));
            }
        }
        return list;
    };
    let settleMs = 0;
    if(!failure) {
        try {
            await waitUntil(() => mismatches(false).length === 0, options.quietTimeout ?? 15000);
            settleMs = Date.now() - healed;
        }
        catch (_) {failure = 'Not the same on every client: ' + mismatches(false).join('\n');}
    }
    if(!failure) {
        const server = pick(upServers());
        log(`${server} sync of the source`);
        await emit(server, {box: 'synced', member, sync: true});
        try {await waitUntil(() => mismatches(true).length === 0, options.quietTimeout ?? 15000);}
        catch (_) {failure = 'After the sync of the source: ' + mismatches(true).join('\n');}
    }

    await Promise.all(cluster.clients.map(client =>
        Promise.all([client.closeDatabox('items'), client.closeDatabox('synced')])));
    delete db.items[member];
    delete db.synced[member];
    cluster.write();
    return {seed, ok: failure === undefined, ms: Date.now() - start, settleMs, actions, trace, failure};
}
