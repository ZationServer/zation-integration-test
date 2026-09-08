/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Controller, ReadStream, Register, Socket} from 'zation-server';

@Register()
@Controller.Config({
    access: 'all',
    input: {
        properties: {
            stream: {chunks: {type: 'string'}}
        }
    }
})
export class UploadStreamController extends Controller
{
    async handle(socket: Socket, {stream}: {stream: ReadStream<string>}) {
        stream.accept();
        const chunks = await stream.readAll();
        return chunks.join('');
    }
}
