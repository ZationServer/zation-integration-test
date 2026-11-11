/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/// <reference types="node" />
import {execFileSync, execFile} from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import {clientConfig} from "../index.test";

const BROWSER_APP = path.join(__dirname, '..', '..', 'browser');

/**
 * The app in browser/ is a Vite app without a vite config (no plugin, no define)
 * with its own dependencies (vite, playwright-core and zation-client).
 */
function installBrowserApp() {
    if(!fs.existsSync(path.join(BROWSER_APP, 'node_modules', 'vite')))
        execFileSync('npm', ['ci', '--no-audit', '--no-fund'], {cwd: BROWSER_APP, stdio: 'ignore'});
}

function runBrowserApp(): Promise<Record<'dev' | 'build' | 'reconnect' | 'resume', any>> {
    return new Promise((resolve, reject) => {
        execFile('node', ['run.js', String(clientConfig.port)], {cwd: BROWSER_APP, timeout: 150000},
            (err, stdout, stderr) => {
                if(err) return reject(new Error(`The browser app failed: ${err.message}\n${stderr}`));
                try {resolve(JSON.parse(stdout.trim().split('\n').pop()!));}
                catch (_) {reject(new Error(`The browser app printed no result:\n${stdout}\n${stderr}`));}
            });
    });
}

describe('Browser tests', function() {
    this.timeout(240000);

    let results: Record<'dev' | 'build' | 'reconnect' | 'resume', any>;

    before(async () => {
        assert.ok(!fs.readdirSync(BROWSER_APP).some(file => file.startsWith('vite.config')),
            'The browser app must not have a vite config.');
        installBrowserApp();
        results = await runBrowserApp();
    });

    for(const [way, title] of [['dev', 'the dev server'], ['build', 'a production build']] as const) {
        it(`Should connect a databox and see a change in a browser with ${title} of Vite.`, () => {
            const result = results[way];
            assert.strictEqual(result.error, undefined, [result.error, ...result.errors].join('\n'));
            assert.deepStrictEqual(result.initial, {value: 0});
            assert.deepStrictEqual(result.changed, {value: 1});
            assert.deepStrictEqual(result.errors, []);
        });
    }

    it('Should bring the reconnect forward when the network comes back, the page becomes visible or is shown again.', () => {
        const result = results.reconnect;
        assert.strictEqual(result.error, undefined, [result.error, ...result.errors].join('\n'));
        //without an event, the client would wait a minute
        assert.ok(result.planned > 50000, `Planned in ${result.planned} ms.`);
        assert.strictEqual(result.offline, null);
        assert.ok(result.online !== null, 'No reconnect when the network came back (online).');
        assert.strictEqual(result.hidden, null, 'A hidden page reconnected.');
        assert.ok(result.visible !== null, 'No reconnect when the page became visible.');
        assert.ok(result.pageshow !== null, 'No reconnect on pageshow.');
        assert.deepStrictEqual(result.errors, []);
    });

    it('Should let many clients come back at random times when the network comes back, but reconnectNow of the app at once.', () => {
        const result = results.resume;
        assert.strictEqual(result.error, undefined, [result.error, ...result.errors].join('\n'));
        //each one waits a random time up to 500 ms (resumeRandomness)
        const plans: (number | null)[] = result.plans;
        assert.ok(plans.every(plan => plan !== null && plan >= 0 && plan <= 500), `Planned in ${plans.join(', ')} ms.`);
        assert.ok(Math.max(...plans as number[]) - Math.min(...plans as number[]) >= 100, `Planned in ${plans.join(', ')} ms.`);
        const delays: number[] = result.afterOnline;
        assert.ok(delays.every(delay => delay >= 0 && delay <= 1500), `Connected after ${delays.map(Math.round).join(', ')} ms.`);
        assert.strictEqual(result.reconnectNow.planned, null, 'reconnectNow of the app did not try at once.');
        assert.ok(result.reconnectNow.ms < 1000, `reconnectNow took ${result.reconnectNow.ms} ms.`);
        assert.deepStrictEqual(result.errors, []);
    });
});
