/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Client, ReadStream, StreamCloseCode, WriteStream} from "zation-client";
import {clientConfig} from "../index.test";
import * as assert from "assert";

describe('Stream tests', function() {
    this.timeout(10000);

    const client = Client.create(clientConfig);

    before(() => client.connect());
    after(() => client.disconnect());

    it('Should upload a stream to a controller.', async () => {
        const stream = new WriteStream();
        const resPromise = client.request('uploadStream', {stream}, {processComplexTypes: true});
        for(const part of ['zat', 'ion', '!']) assert.strictEqual(await stream.write(part), true);
        assert.strictEqual(await stream.end(), true);
        assert.strictEqual(await resPromise, 'zation!');
        assert.strictEqual(await stream.closed, StreamCloseCode.End);
    });

    it('Should close the stream when a chunk does not match the chunk model.', async () => {
        const stream = new WriteStream();
        const resPromise = client.request('uploadStream', {stream}, {processComplexTypes: true});
        await stream.write('valid');
        await stream.write(42);
        assert.strictEqual(await stream.closed, StreamCloseCode.InvalidChunk);
        await assert.rejects(resPromise);
    });

    it('Should download a stream from a controller.', async () => {
        const {stream} = await client.request('downloadStream', 6);
        assert.ok(stream instanceof ReadStream);
        stream.accept();
        assert.deepStrictEqual(await stream.readAll(), [0, 1, 2, 3, 4, 5]);
        assert.strictEqual(stream.closedSuccessfully, true);
    });
});
