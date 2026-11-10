/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/*
Soak run of a cluster (state server, brokers, servers, clients) with faults.
Invariant: after a quiet phase every client shows the source; the data that several servers sync is the same
on every client, and the source after one more sync of it.

  npx ts-node soak/run.ts [--seeds 1-1000] [--brokers 1] [--clients 4] [--no-faults] [--keep-going] [--port 5100]
      [--skew C=3000,B=-1500] (clock skew of servers in ms)

A failing seed repeats with --seeds <seed> (the changes and faults; the timing of the processes varies).
*/

/// <reference types="node" />
import {SoakCluster} from "./cluster";
import {runEpisode} from "./episode";

function arg(name: string): string | undefined {
    const index = process.argv.indexOf('--' + name);
    return index === -1 ? undefined : (process.argv[index + 1] ?? '');
}

function seedList(spec: string): number[] {
    const seeds: number[] = [];
    for(const part of spec.split(',')) {
        const [from, to] = part.split('-').map(Number);
        for(let seed = from; seed <= (to ?? from); seed++) seeds.push(seed);
    }
    return seeds;
}

async function main() {
    const seeds = seedList(arg('seeds') || '1-20');
    const keepGoing = process.argv.includes('--keep-going');
    const skew: Record<string, number> = {};
    for(const part of (arg('skew') || '').split(',').filter(Boolean)) {
        const [name, ms] = part.split('=');
        skew[name] = Number(ms);
    }
    const cluster = await SoakCluster.start({
        brokers: Number(arg('brokers') || 1),
        basePort: Number(arg('port') || 5100),
        skew
    });
    const results: {seed: number, ok: boolean, ms: number, settleMs: number}[] = [];
    const totals: Record<string, number> = {};
    const started = Date.now();
    let exitCode = 0;
    try {
        for(let i = 0, len = Number(arg('clients') || 4); i < len; i++)
            await cluster.addClient(cluster.servers[i % cluster.servers.length]);
        for(const seed of seeds) {
            const result = await runEpisode(cluster, seed, {faults: !process.argv.includes('--no-faults')});
            results.push(result);
            for(const key in result.actions) totals[key] = (totals[key] || 0) + result.actions[key];
            if(result.ok) process.stdout.write(`seed ${seed} ok ${result.ms}ms (settled ${result.settleMs}ms)\n`);
            else {
                exitCode = 1;
                console.log(`seed ${seed} FAILED after ${result.ms}ms\n${result.failure}\n--- trace\n${result.trace.join('\n')}\n---`);
                if(!keepGoing) break;
            }
        }
    }
    finally {
        await cluster.stop();
    }
    const failed = results.filter(result => !result.ok).map(result => result.seed);
    const ms = results.map(result => result.ms).sort((a, b) => a - b);
    const settle = results.filter(result => result.ok).map(result => result.settleMs).sort((a, b) => a - b);
    const at = (list: number[], q: number) => list.length ? list[Math.min(list.length - 1, Math.floor(q * list.length))] : 0;
    console.log(JSON.stringify({
        seeds: results.length, failed, totalSeconds: Math.round((Date.now() - started) / 1000),
        episodeMs: {median: at(ms, 0.5), p95: at(ms, 0.95), max: at(ms, 1)},
        settleMs: {median: at(settle, 0.5), p95: at(settle, 0.95), max: at(settle, 1)},
        actions: totals,
        skew
    }, null, 1));
    process.exit(exitCode);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
