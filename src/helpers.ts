import { body, ValidationChain, validationResult } from "express-validator";

export const addProductValidator = [
  body('url').isURL().withMessage("Invalid Url"),
  body('targetPrice').isFloat({ min: 1 }).withMessage("Target Price should be greater than 0"),
  body('notify').optional().isBoolean().withMessage("Notification can be either true or false"),
  body('email').optional().isEmail().withMessage("Valid Email required"),
  body('mobile').optional().isMobilePhone('any').withMessage("Valid phone number required"),
];

export const validateBody = (validations: ValidationChain[]) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result["errors"].length) break;
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ type: 'error', message: errors["errors"][errors["errors"].length - 1].msg });
  };
};

export const getStoreName = (url: string): string => {
  let result = url.replace("https://", "");
  result = result.replace("http://", "");
  result = result.replace("www", "");
  return result.split('.')[1]
}

export const cleanPrice = (price: string): number => Number(price.trim().replace(',', '').replace('₹', ''));

export const cleanProductName = (name: string, numberOfWords: number = 6): string => name.trim().split(' ').slice(0, numberOfWords).join(' ')

export const getRandomIndex = (arrayLength: number): number => Math.floor(Math.random() * arrayLength);

export const myCustomSort = (products: any): any => {
  let sorted = [];
  let flipkart = [];
  let amazon = [];
  let length = 0;
  let pickedArray = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].store == 'flipkart') {
      flipkart.push(products[i]);
    }
    if (products[i].store == 'amazon') {
      amazon.push(products[i]);
    }
  }
  // Check which one has more items
  if (flipkart?.length > length) {
    length = flipkart?.length;
    pickedArray = flipkart;
  }
  if (amazon?.length > length) {
    length = amazon?.length;
    pickedArray = amazon;
  }

  for (let i = 0; i < pickedArray?.length; i++) {
    if (flipkart[i] !== undefined) {
      sorted.push(flipkart[i]);
    }
    if (amazon[i] !== undefined) {
      sorted.push(amazon[i]);
    }
  }

  return sorted;
}