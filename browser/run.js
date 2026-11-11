/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/**
 * Loads the app (index.html, main.js) in a headless browser, without a vite config,
 * so without a plugin and without a define: once from the dev server (dependency optimizer)
 * and once from a production build. The zation server must run on the port of the first argument.
 * On the dev server, reconnect.html shows how the events of the browser bring a reconnect forward
 * and resume.html that many clients come back at random times.
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

/**
 * Loads reconnect.html, drops the connection and brings the planned reconnect (in a minute) forward:
 * the network comes back (offline, then online), the page becomes visible (after hidden)
 * and the page is shown again (pageshow). Each value is how long the reconnect took in ms,
 * null without one (offline and hidden: no reconnect is expected).
 */
async function reconnect(browser, url) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(String(err && err.stack || err)));
    page.on('console', msg => {if(msg.type() === 'error') errors.push(msg.text());});
    const back = async (timeout) => {
        const start = Date.now();
        try {
            await page.waitForFunction(() => window.zation.connected(), null, {timeout});
            return Date.now() - start;
        }
        catch (_) {return null;}
    };
    const lose = async () => {
        await page.evaluate(() => window.zation.drop());
        await page.waitForFunction(() => window.zation.nextReconnectAt() !== null, null, {timeout: 5000});
        return page.evaluate(() => window.zation.nextReconnectAt() - Date.now());
    };
    try {
        await page.goto(`${url}reconnect.html?port=${serverPort}`);
        await page.waitForFunction(() => window.zation !== undefined && window.zation.connected(), null, {timeout: 20000});
        const result = {errors};
        result.planned = await lose();
        await context.setOffline(true);
        result.offline = await back(300);
        await context.setOffline(false);
        result.online = await back(5000);
        await lose();
        await page.evaluate(() => window.zation.setVisibility('hidden'));
        result.hidden = await back(500);
        await page.evaluate(() => window.zation.setVisibility('visible'));
        result.visible = await back(5000);
        await lose();
        await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted: true})));
        result.pageshow = await back(5000);
        return result;
    }
    catch (err) {return {error: String(err && err.message || err), errors};}
    finally {await context.close();}
}

/**
 * Loads resume.html (many clients on one page), drops their connections and lets the network come back:
 * plans is in how many ms each client tries after the online event (null: at once),
 * afterOnline how long each one took to connect.
 * Then the app calls reconnectNow: how long the client took to connect and its plan right after the call
 * (null, the attempt goes at once).
 */
async function resume(browser, url) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(String(err && err.stack || err)));
    page.on('console', msg => {if(msg.type() === 'error') errors.push(msg.text());});
    const lose = async () => {
        await page.evaluate(() => window.zation.drop());
        await page.waitForFunction(() => window.zation.planned(), null, {timeout: 5000});
    };
    try {
        await page.goto(`${url}resume.html?port=${serverPort}`);
        await page.waitForFunction(() => window.zation !== undefined && window.zation.connected(), null, {timeout: 20000});
        await lose();
        await context.setOffline(true);
        await context.setOffline(false);
        await page.waitForFunction(() => window.zation.connected(), null, {timeout: 5000});
        const result = {errors, plans: await page.evaluate(() => window.zation.plans()),
            afterOnline: await page.evaluate(() => window.zation.afterOnline())};
        await lose();
        result.reconnectNow = await page.evaluate(() => window.zation.reconnectNow());
        return result;
    }
    catch (err) {return {error: String(err && err.message || err), errors};}
    finally {await context.close();}
}

async function viaDevServer(browser) {
    // A new cache, so that the dependency optimizer bundles the installed client.
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zation-vite-cache-'));
    const server = await createServer({...viteOptions, cacheDir, server: {host: '127.0.0.1', port: 0}});
    try {
        await server.listen();
        const url = server.resolvedUrls.local[0];
        return {dev: await load(browser, url, 'dev'), reconnect: await reconnect(browser, url), resume: await resume(browser, url)};
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
    const {dev, reconnect: reconnected, resume: resumed} = await viaDevServer(browser);
    const built = await viaBuild(browser);
    console.log(JSON.stringify({dev, build: built, reconnect: reconnected, resume: resumed}));
}
finally {await browser.close();}
