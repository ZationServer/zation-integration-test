/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Controller, Register, ReturnsComplexData, Socket, WriteStream} from 'zation-server';

@Register()
@Controller.Config({
    access: 'all',
    input: {type: 'int', minValue: 0}
})
export class DownloadStreamController extends Controller
{
    @ReturnsComplexData
    async handle(socket: Socket, count: number) {
        const stream = new WriteStream();
        (async () => {
            for(let i = 0; i < count; i++) await stream.write(i);
            await stream.end();
        })();
        return {stream};
    }
}
