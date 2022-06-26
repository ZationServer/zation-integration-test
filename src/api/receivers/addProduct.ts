/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {Inject, ModelProp, ObjectModel, Receiver, Register, Socket} from "zation-server";
import {ProductsDatabox} from "../databoxes/products";

@ObjectModel()
class Product {
    readonly id = ModelProp({type: 'string'});
    readonly name = ModelProp({type: 'string'});
    readonly price = ModelProp({type: 'number'});
}

@Register()
@Receiver.Config({
    access: 'all',
    input: Product
})
export class AddProductReceiver extends Receiver
{
    @Inject(ProductsDatabox)
    private readonly productsDatabox: ProductsDatabox;

    handle(socket: Socket, product: Product) {
        this.productsDatabox.content().insert(product.id,{
            name: product.name,
            price: product.price
        });
    }
}
