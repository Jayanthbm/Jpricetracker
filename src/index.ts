const axios = require('axios')
const express = require('express');
const jsdom = require("jsdom");

import { AppDataSource } from "./data-source"
import { Products } from "./entity/Products";
import { storesEnum } from "./enums/allEnums";
import { addProductValidator, getRandomIndex, getStoreName, queryOutOfStock, queryProductName, queryProductPrice, userAgents, validateBody } from "./helpers";

const { JSDOM } = jsdom;
async function getAllProducts() {
    try {
        const products = await AppDataSource.manager.find(Products);
        return products;
    } catch (error) {
        console.log("error fetching products", error);
        return [];
    }
}

(async () => {
    try {
        await AppDataSource.initialize();
        console.log("Connection Successful to DB");
        var products = await getAllProducts();
        if (products?.length > 0) {
            console.log(`${products?.length} Products Found`);
        } else {
            console.log("No products Added")
        }
    } catch (error) {
        console.log("Error Connecting to DB", error)
    }
})();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get('/', async (req, res) => {
    res.send({
        type: 'success',
        message: 'Hello World',
    })
});

app.post('/addProduct', validateBody(addProductValidator), async (req, res) => {
    try {
        const { targetPrice, notify, email, mobile } = req.body;
        let { url } = req.body;
        let productPrice: number = 0;
        let store = '';
        let productName = '';
        let outofStock = false;
        store = getStoreName(url);
        url = url.split('?')[0];
        const result = await axios.get(url, {
            headers: {
                "User-Agent": userAgents[getRandomIndex(userAgents.length)]
            }
        })
        const { document } = new JSDOM(result.data).window;
        productName = queryProductName(document, storesEnum[`${store}`]);
        productPrice = queryProductPrice(document, storesEnum[`${store}`]);
        outofStock = queryOutOfStock(document, storesEnum[`${store}`]);
        const product = new Products();
        product.url = url;
        product.price = productPrice;
        product.targetPrice = targetPrice;
        product.store = storesEnum[`${store}`];
        product.productName = productName;
        product.notify = notify;
        product.email = email;
        product.mobile = mobile;
        // await AppDataSource.getRepository(Products).save(product);
        res.send({
            type: 'success',
            message: 'Product Added',
            product,
            outofStock
        })
    } catch (error) {
        let message = 'Error Adding the product'
        if (error?.code == 'ER_DUP_ENTRY') {
            message = 'Product Already added'
        }
        res.status(400).send({
            type: 'error',
            message,
        })
    }
})

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))