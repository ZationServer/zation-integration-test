/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import * as assert from "assert";
import {SoakCluster} from "../../soak/cluster";
import {runEpisode} from "../../soak/episode";

/*
A short soak run (SOAK_SEEDS, default 1-10; SOAK_HISTORY_BUDGET for the databoxHistoryBudget of the servers);
the long one: npx ts-node soak/run.ts --seeds 1-1000
*/
describe('Soak (cluster with faults)', function () {
    this.timeout(20 * 60 * 1000);

    let cluster: SoakCluster;
    before(async () => {
        const budget = process.env.SOAK_HISTORY_BUDGET;
        cluster = await SoakCluster.start({basePort: 5600, historyBudget: budget ? Number(budget) : undefined});
        for(let i = 0; i < 4; i++) await cluster.addClient(cluster.servers[i % cluster.servers.length]);
    });
    after(async () => cluster?.stop());

    it('Should show the source on every client after each quiet phase.', async () => {
        const [from, to] = (process.env.SOAK_SEEDS || '1-10').split('-').map(Number);
        for(let seed = from; seed <= (to ?? from); seed++) {
            const result = await runEpisode(cluster, seed);
            assert.ok(result.ok, `seed ${seed}: ${result.failure}\n${result.trace.join('\n')}`);
        }
    });
});
