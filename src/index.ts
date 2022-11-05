const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const jsdom = require("jsdom");

var cron = require('node-cron');

import { AppDataSource } from "./data-source"
import { storesEnum } from "./enums/allEnums";
import { addProductValidator, getStoreName, validateBody } from "./helpers";
import { fetchProductDocument, queryProductName, queryProductPrice } from "./scrapper";
import { getProductByUrl, getTrackedProductByIdEmail } from "./db";

import { Products } from "./entity/products.entity";

import { ProductTracking } from "./entity/product-tracking.entity";

import { createSpinner } from 'nanospinner'
import { trackProducts } from "./product-tracking";
import { EventEmitter } from "stream";
const { JSDOM } = jsdom;
// Main Function
var dataSource;
(async () => {
    const dbspinner = createSpinner('Connecting To DB').start();
    dataSource = await AppDataSource.initialize();
    dbspinner.success({ text: 'Connection Successful to DB!', mark: ':)' });
    // cron.schedule('*/6 * * * *', async () => {
    //     await trackProducts()
    // });
})();

const eventHandler = new EventEmitter();

eventHandler.on('trackProducts', async () => {
    await trackProducts(dataSource)
})

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
        store = getStoreName(url);
        url = url.split('?')[0];
        let product = await getProductByUrl(AppDataSource, url);
        let savedProduct;
        if (product) {
            savedProduct = product;
        } else {
            let data = await fetchProductDocument(url);
            const { document } = new JSDOM(data).window;
            productName = queryProductName(document, storesEnum[`${store}`]);
            productPrice = queryProductPrice(document, storesEnum[`${store}`]);
            product = new Products();
            product.url = url
            product.productName = productName;
            product.price = productPrice;
            product.store = storesEnum[`${store}`];
            savedProduct = await AppDataSource.manager.save(product);
        }

        let tracked = await getTrackedProductByIdEmail(AppDataSource, savedProduct?.id, email);
        if (!tracked) {
            tracked = new ProductTracking();
        }
        tracked.targetPrice = targetPrice;
        tracked.email = email;
        tracked.mobile = mobile;
        tracked.product = savedProduct;
        await AppDataSource.manager.save(tracked)

        let productInformation = {
            productName: savedProduct?.productName,
            productPrice: savedProduct?.productPrice,
            store: savedProduct?.store,
            targetPrice,
            email,
            mobile
        }
        res.send({
            type: 'success',
            message: 'Product Tracked',
            productInformation

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

app.get('/trackProducts', async (req, res) => {
    try {
        // let result = await trackProducts();
        eventHandler.emit('trackProducts');
        return res.send({
            type: 'success',
            message: 'Tracking Satared'
        });
    } catch (error) {
        return res.status(400).send("Error tracking products");
    }
})

app.listen(port, () => {
    const aSpinner = createSpinner('Starting Server').start()
    aSpinner.success({ text: `Price Tracker app listening on port ${port}!`, mark: ':)' })
})