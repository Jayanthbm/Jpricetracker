const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const jsdom = require("jsdom");
const fs = require("fs")
const path = require("path")
const handlebars = require("handlebars")
var cron = require('node-cron');
import { AppDataSource } from "./data-source"
import { storesEnum } from "./enums/allEnums";
import { addProductValidator, getStoreName, myCustomSort, validateBody } from "./helpers";
import { fetchProductDocument, queryOutOfStock, queryProductName, queryProductPrice } from "./scrapper";
import { getAllProducts, getProductByUrl, getTrackedProductByIdEmail, getTrackedProductsByIdPrice } from "./db";
import { sendEmail } from "./email";
import { Products } from "./entity/products.entity";
import { PriceTracking } from "./entity/price-tracking.entity";
import { ProductTracking } from "./entity/product-tracking.entity";
const { JSDOM } = jsdom;
import { createSpinner } from 'nanospinner'
// Main Function
(async () => {
    try {
        const dbspinner = createSpinner('Connecting To DB').start()
        const dataSource = await AppDataSource.initialize();
        dbspinner.success({ text: 'Connection Successful to DB!', mark: ':)' })
        cron.schedule('0 */2 * * *', async () => {
            const dateObject = new Date();
            const date = (`0 ${dateObject.getDate()}`).slice(-2);
            const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
            const year = dateObject.getFullYear();
            const hours = dateObject.getHours();
            const minutes = dateObject.getMinutes();
            const seconds = dateObject.getSeconds();
            console.log(`fetching Product Prices - ${year}-${month}-${date} ${hours}:${minutes}:${seconds}`);
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

                let productPrice = queryProductPrice(document, storesEnum[`${storedProduct?.store}`]);
                let outofStock = queryOutOfStock(document, storesEnum[`${storedProduct?.store}`]);

                let tmp = {
                    fetchedPrice: productPrice,
                    outOfStock: outofStock,
                    product: storedProduct?.id,
                }
                finalInsert.push(tmp);

                if (!outofStock) {
                    // Get All users who tracked the product
                    let trackedInfo = await getTrackedProductsByIdPrice(dataSource, storedProduct.id, productPrice);
                    for (let n = 0; n < trackedInfo.length; n++) {
                        toNotify.push({
                            productName: storedProduct?.productName,
                            targetPrice: trackedInfo[i].targetPrice,
                            store: storedProduct?.store,
                            url: storedProduct?.url,
                            email: trackedInfo[i].email,
                            mobile: trackedInfo[i].mobile,
                            currentPrice: productPrice,
                        })
                    }
                }
            }

            if (finalInsert?.length > 0) {
                await dataSource.createQueryBuilder().insert().into(PriceTracking).orIgnore().values(finalInsert).execute();
            }
            for (let i = 0; i < toNotify?.length; i++) {
                const htmlToSend = template({
                    productName: toNotify[i].productName,
                    targetPrice: toNotify[i].targetPrice,
                    price: toNotify[i].currentPrice,
                    store: toNotify[i].store,
                    url: toNotify[i].url
                });
                let emailToSend = {
                    to: toNotify[i].email,
                    subject: `${toNotify[i].productName} Price Dropped to ${toNotify[i].currentPrice}`,
                    html: htmlToSend
                }
                await sendEmail(emailToSend);
            }
        });


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

app.listen(port, () => {
    const aSpinner = createSpinner('Starting Server').start()
    aSpinner.success({ text: `Price Tracker app listening on port ${port}!`, mark: ':)' })
})