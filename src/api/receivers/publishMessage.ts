/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Inject, ModelProp, ObjectModel, Receiver, Register, Socket} from "zation-server";
import {ChatChannel} from "../channels/chat";

@ObjectModel()
class ChatMessage {
    readonly chatId = ModelProp({type: 'string'});
    readonly content = ModelProp({type: 'string'});
}

@Register()
@Receiver.Config({
    access: 'all',
    input: ChatMessage
})
export class PublishMessageReceiver extends Receiver
{

    @Inject(ChatChannel)
    private readonly chatChannel: ChatChannel;

    handle(socket: Socket, input: ChatMessage) {
        this.chatChannel.publish(input.chatId,'message',input.content);
    }

}
