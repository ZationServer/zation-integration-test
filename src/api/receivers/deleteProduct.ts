/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Inject, Receiver, Register, Socket} from "zation-server";
import {ProductsDatabox} from "../databoxes/products";

@Register()
@Receiver.Config({
    access: 'all',
    input: {type: 'string'}
})
export class DeleteProductReceiver extends Receiver
{
    @Inject(ProductsDatabox)
    private readonly productsDatabox: ProductsDatabox;

    handle(socket: Socket, id: string) {
        this.productsDatabox.content()[id].delete();
    }
}
