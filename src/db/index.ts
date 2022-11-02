import { Products } from "../entity/products.entity";

export const getAllProducts = async (dataSource: any): Promise<Products[]> => {
  try {
    return []
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