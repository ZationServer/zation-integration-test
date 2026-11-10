/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/**
 * Loads the app (index.html, main.js) in a headless browser, without a vite config,
 * so without a plugin and without a define: once from the dev server (dependency optimizer)
 * and once from a production build. The zation server must run on the port of the first argument.
 * Prints the result of each way as JSON.
 */

import {build, createServer, preview} from 'vite';
import {chromium} from 'playwright-core';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const serverPort = Number(process.argv[2]);
const viteOptions = {root, configFile: false, logLevel: 'error', clearScreen: false};

async function load(browser, url, counter) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(String(err && err.stack || err)));
    page.on('console', msg => {if(msg.type() === 'error') errors.push(msg.text());});
    try {
        await page.goto(`${url}?port=${serverPort}&counter=${counter}`);
        await page.waitForFunction(() => window.zationResult !== undefined, null, {timeout: 20000});
        return {...await page.evaluate(() => window.zationResult), errors};
    }
    catch (err) {return {error: String(err && err.message || err), errors};}
    finally {await page.close();}
}

async function viaDevServer(browser) {
    // A new cache, so that the dependency optimizer bundles the installed client.
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zation-vite-cache-'));
    const server = await createServer({...viteOptions, cacheDir, server: {host: '127.0.0.1', port: 0}});
    try {
        await server.listen();
        return await load(browser, server.resolvedUrls.local[0], 'dev');
    }
    finally {
        await server.close();
        fs.rmSync(cacheDir, {recursive: true, force: true});
    }
}

async function viaBuild(browser) {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zation-vite-build-'));
    try {
        await build({...viteOptions, build: {outDir, emptyOutDir: true}});
        const server = await preview({...viteOptions, build: {outDir}, preview: {host: '127.0.0.1', port: 0}});
        try {return await load(browser, server.resolvedUrls.local[0], 'build');}
        finally {await server.close();}
    }
    finally {fs.rmSync(outDir, {recursive: true, force: true});}
}

const browser = await chromium.launch({headless: true});
try {
    const dev = await viaDevServer(browser);
    const built = await viaBuild(browser);
    console.log(JSON.stringify({dev, build: built}));
}
finally {await browser.close();}
