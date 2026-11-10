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

function runBrowserApp(): Promise<Record<'dev' | 'build', any>> {
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

    let results: Record<'dev' | 'build', any>;

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
});
