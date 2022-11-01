import { body, ValidationChain, validationResult } from "express-validator";
import { storesEnum } from "./enums/allEnums";

export const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/605.1.15 (KHTML, like Gecko)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15"
];

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


export const queryProductName = (document: any, store: storesEnum): string => {
  let productName = '';
  if (store === storesEnum.flipkart) {
    productName = document.querySelector('.B_NuCI').textContent;
  }

  if (store === storesEnum.amazon) {
    productName = document.getElementById('productTitle').textContent;
  }

  return cleanProductName(productName);
}

export const queryProductPrice = (document: any, store: storesEnum): number => {
  let fetchedPrice = '';
  if (store === storesEnum.flipkart) {
    fetchedPrice = document.querySelector('._25b18c').childNodes[0].textContent;
  }
  if (store === storesEnum.amazon) {
    fetchedPrice = document.querySelector('.a-price-whole').childNodes[0].textContent;
  }

  return cleanPrice(fetchedPrice)
}

export const queryOutOfStock = (document: any, store: storesEnum): boolean => {
  if (store === storesEnum.flipkart) {
    if (document.querySelector('._16FRp0')) {
      return true;
    }
  }
  if (store === storesEnum.amazon) {
    if (document.getElementById('availability').textContent.trim().includes('Currently unavailable')) {
      return true;
    }
  }

  return false;
}