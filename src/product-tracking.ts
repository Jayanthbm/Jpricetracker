import { getAllProducts, getTrackedProductsByIdPrice, insertPriceTrackingInfo } from "./db";
import { sendEmail } from "./email";
import { storesEnum } from "./enums/allEnums";
import { fetchProductDocument, queryOutOfStock, queryProductPrice } from "./scrapper";

const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const chalk = require('chalk');
const date = require('date-and-time');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
export const trackProducts = async (dataSource) => {

  let products = [], finalInsert = [], toNotify = [];
  const now = new Date();
  console.log('Fetching products at ' + chalk.red(date.format(now, 'DD MMM YY hh:mm A')))
  console.log(chalk.blue.bold("####################### Fetching Product Prices ###########################"));
  try {
    products = await getAllProducts(dataSource, true);
    console.log(chalk.red(`${products?.length} Products Found`));
  } catch (error) {
    console.log("Error Fetching products", error);
  }
  for (let i = 0; i < products.length; i++) {
    let storedProduct = products[i], productPrice, outofStock = false, trackedInfo, data;
    console.log('Fetchng ' + chalk.yellow(storedProduct.productName) + ' details from ' + chalk.red(storedProduct.store.toUpperCase()));
    try {
      data = await fetchProductDocument(storedProduct?.url);
    } catch (error) {
      console.log("Error fetching prodct", error);
    }

    const { document } = new JSDOM(data).window;
    try {
      productPrice = queryProductPrice(document, storesEnum[`${storedProduct?.store}`]);
      console.log('Fetched Price: ₹' + chalk.green(productPrice));
      outofStock = queryOutOfStock(document, storesEnum[`${storedProduct?.store}`]);
    } catch (error) {
      productPrice = 0;
      outofStock = true;
      console.log("Error fetching product information", error);
    }

    if (productPrice > 0) {
      let tmp = {
        fetchedPrice: productPrice,
        outOfStock: outofStock,
        product: storedProduct?.id,
      }
      finalInsert.push(tmp);
    }

    if (!outofStock) {
      console.log(chalk.green('Product In Stock'));
      try {
        // Get All users who tracked the product
        trackedInfo = await getTrackedProductsByIdPrice(dataSource, storedProduct.id, productPrice);
        console.log(trackedInfo?.length + " user(s) reached the target price");
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
      } catch (error) {
        console.log("Error fetching product tracking infromation")
      }
    } else {
      console.log(chalk.red('Product Out of Stock'));
    }
    console.log(chalk.red("--------------------------------------------------"));
  }

  let inserted = await insertPriceTrackingInfo(dataSource, finalInsert);
  await sendEmails(toNotify);
  console.log(chalk.blue(inserted + ' rows added ') + chalk.green(toNotify?.length + ' emails sent'))
  console.log(chalk.red("########################## Fetching Complete #############################"));

  return true;
}


export const sendEmails = async (notify: any) => {
  const priceDropTemplate = fs.readFileSync(path.join(__dirname, "/templates/pricedrop.hbs"), "utf8")
  const template = handlebars.compile(priceDropTemplate);
  for (let i = 0; i < notify?.length; i++) {
    try {
      console.log(chalk.yellow("Sending Email to ") + chalk.green(notify[i].email));
      const htmlToSend = template({
        productName: notify[i].productName,
        targetPrice: notify[i].targetPrice,
        price: notify[i].currentPrice,
        store: notify[i].store,
        url: notify[i].url
      });
      let emailToSend = {
        to: notify[i].email,
        subject: `${notify[i].productName} Price Dropped to ${notify[i].currentPrice}`,
        html: htmlToSend
      }
      await sendEmail(emailToSend);
    } catch (error) {
      console.log(chalk.red("error sending email to ") + chalk.green(notify[i].email));
    }
  }
}