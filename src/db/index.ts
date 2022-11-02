import { LessThanOrEqual } from "typeorm";
import { ProductTracking } from "../entity/product-tracking.entity";
import { Products } from "../entity/products.entity";

export const getAllProducts = async (dataSource: any): Promise<Products[]> => {
  try {
    const products = await dataSource.getRepository(Products).find();
    return products;
  } catch (error) {
    console.log("error fetching products", error);
    return []
  }
}

export const getProductById = async (dataSource: any, productId: number): Promise<Products> => {
  try {
    const product = await dataSource.getRepository(Products).findOneBy({
      id: productId,
    });
    return product;
  } catch (error) {
    console.log("error fetching products", error);
    return null;
  }
}

export const getProductByUrl = async (dataSource: any, url: string): Promise<Products> => {
  try {
    const product = await dataSource.getRepository(Products).findOneBy({
      url,
    });
    return product;
  } catch (error) {
    console.log("error fetching products", error);
    return null;
  }
}

export const removeProductById = async (dataSource: any, productId: number): Promise<boolean> => {
  try {
    await dataSource.getRepository(Products).delete({
      id: productId,
    })
    return true;
  } catch (error) {
    console.log("Error deleting the Product", error);
    return false;
  }
}

export const getTrackedProductsById = async (dataSource: any, productId: number): Promise<ProductTracking[]> => {
  try {
    const tracked = await dataSource.getRepository(ProductTracking).find({
      product: productId
    });
    return tracked;
  } catch (error) {
    console.log("error fetching products", error);
    return [];
  }
}

export const getTrackedProductByIdEmail = async (dataSource: any, productId: number, email: string): Promise<ProductTracking> => {
  try {
    const trackedInfo = await dataSource.getRepository(ProductTracking).findOneBy({
      product: productId,
      email: email
    });
    return trackedInfo;
  } catch (error) {
    console.log("error fetching products", error);
    return null;
  }
}

export const getTrackedProductsByIdPrice = async (dataSource: any, productId: number, price: number): Promise<ProductTracking[]> => {
  try {
    const trackedInfo = await dataSource.getRepository(ProductTracking).createQueryBuilder('pt').where("pt.productId =:productId", { productId })
      .andWhere("pt.targetPrice <= :price", { price }).getMany();
    return trackedInfo;
  } catch (error) {
    console.log("error fetching products", error);
    return [];
  }
}