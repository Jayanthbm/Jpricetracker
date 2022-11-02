const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const jsdom = require("jsdom");
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")

import { AppDataSource } from "./data-source"
import { storesEnum } from "./enums/allEnums";
import { addProductValidator, getStoreName, myCustomSort, validateBody } from "./helpers";
import { fetchProductDocument, queryOutOfStock, queryProductName, queryProductPrice } from "./scrapper";
import { getAllProducts } from "./db";
import { sendEmail } from "./email";
import { Products } from "./entity/products.entity";
import { PriceTracking } from "./entity/price-tracking.entity";


const { JSDOM } = jsdom;

// Main Function
(async () => {
    try {
        const dataSource = await AppDataSource.initialize();
        console.log("Connection Successful to DB");
        var products = await getAllProducts(dataSource);
        console.log(`${products?.length} Products Found`);
        var sortedProd = myCustomSort(products);

        const priceDropTemplate = fs.readFileSync(path.join(__dirname, "/templates/pricedrop.hbs"), "utf8")
        const template = handlebars.compile(priceDropTemplate);

        var finalInsert = [];
        var toNotify = [];
        for (let i = 0; i < sortedProd?.length; i++) {
            let storedProduct = sortedProd[i];
            let data = await fetchProductDocument(storedProduct?.url);
            const { document } = new JSDOM(data).window;
            let oldPrice = storedProduct?.price;
            let priceDecreased = false;
            let targetPrice = storedProduct?.targetPrice;
            let productPrice = queryProductPrice(document, storesEnum[`${storedProduct?.store}`]);
            let outofStock = queryOutOfStock(document, storesEnum[`${storedProduct?.store}`]);
            if (productPrice < oldPrice) {
                priceDecreased = true;
            }
            let priceDifference = Math.abs(oldPrice - productPrice);

            // Check if Product reached target price and
            if (productPrice <= targetPrice) {
                let tmpNotify = {
                    url: storedProduct.url,
                    store: storedProduct.store,
                    productName: storedProduct?.productName,
                    targetPrice: storedProduct?.targetPrice,
                    currentPrice: productPrice,
                    priceDifference,
                    email: storedProduct.email,
                    mobile: storedProduct?.mobile
                }
                toNotify.push(tmpNotify)
            }

            let tmp = {
                fetchedPrice: productPrice,
                product: storedProduct?.id,
                priceDifference: priceDifference,
                priceDecreased: priceDecreased,
                outOfStock: outofStock,
            }
            finalInsert.push(tmp);
        }
        if (finalInsert?.length > 0) {
            await dataSource.createQueryBuilder().insert().into(PriceTracking).orIgnore().values(finalInsert).execute();
        }
        for (let i = 0; i < toNotify?.length; i++) {
            const htmlToSend = template({
                productName: toNotify[i].productName,
                targetPrice: toNotify[i].targetPrice,
                price: toNotify[i].currentPrice,

            });
            let emailToSend = {
                to: toNotify[i].email,
                subject: `${toNotify[i].productName} Price Dropped to ${toNotify[i].currentPrice}`,
                html: htmlToSend
            }
            await sendEmail(emailToSend);

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
        let data = await fetchProductDocument(url);
        const { document } = new JSDOM(data).window;
        productName = queryProductName(document, storesEnum[`${store}`]);
        productPrice = queryProductPrice(document, storesEnum[`${store}`]);
        outofStock = queryOutOfStock(document, storesEnum[`${store}`]);
        const product = new Products();
        product.url = url;
        product.price = productPrice;
        product.store = storesEnum[`${store}`];
        product.productName = productName;
        await AppDataSource.getRepository(Products).save(product);
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

app.listen(port, () => console.log(`Price Tracker app listening on port ${port}!`))