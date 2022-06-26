/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Inject, ModelProp, ObjectModel, Receiver, Register, Socket} from "zation-server";
import {NewsChannel} from "../channels/news";

@ObjectModel()
class News {
    readonly title = ModelProp({type: 'string'});
    readonly description = ModelProp({type: 'string'});
}

@Register()
@Receiver.Config({
    access: 'all',
    input: News
})
export class PublishNewsReceiver extends Receiver
{

    @Inject(NewsChannel)
    private readonly newsChannel: NewsChannel;

    handle(socket: Socket, news: News) {
        this.newsChannel.publish('news',news);
    }

}
