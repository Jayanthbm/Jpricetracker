import { storesEnum } from "../enums/allEnums";
import { cleanPrice, cleanProductName, getRandomIndex } from "../helpers";

const axios = require('axios');

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

export const fetchProductDocument = async (url: any) => {
  url = url.split('?')[0];
  const result = await axios.get(url, {
    headers: {
      "User-Agent": userAgents[getRandomIndex(userAgents.length)]
    }
  });

  return result?.data;
}

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