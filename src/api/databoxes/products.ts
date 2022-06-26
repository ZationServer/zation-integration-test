/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import {FetchRequest, Register, StaticDatabox} from "zation-server";
import {StaticDbInConnection} from "zation-server";

interface Product {
    name: string,
    price: number
}

export const PRODUCTS = [
    {
        name: 'Laptop',
        price: 800
    },
    {
        name: 'Tablet',
        price: 400
    }
];

@Register()
@StaticDatabox.Config({
    access: 'all'
})
export class ProductsDatabox extends StaticDatabox<Product[]>
{
    protected async singleFetch(request: FetchRequest, connection: StaticDbInConnection): Promise<Product[]> {
        return this.buildKeyArray([
            ["0",PRODUCTS[0]],
            ["1",PRODUCTS[1]]
        ]);
    }
}
