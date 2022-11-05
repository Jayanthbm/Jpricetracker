import { PriceTracking } from "../entity/price-tracking.entity";
import { ProductTracking } from "../entity/product-tracking.entity";
import { Products } from "../entity/products.entity";
import { myCustomSort } from "../helpers";

export const getAllProducts = async (dataSource: any, customSort = false): Promise<Products[]> => {
  try {
    let products = await dataSource.getRepository(Products).find();
    if (customSort) {
      return myCustomSort(products);
    }
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
    const trackedInfo = await dataSource.getRepository(ProductTracking).createQueryBuilder('pt').where("pt.productId =:productId", { productId })
      .andWhere("pt.email = :email", { email }).getOne();
    return trackedInfo;
  } catch (error) {
    console.log("error fetching products", error);
    return null;
  }
}

export const getTrackedProductsByIdPrice = async (dataSource: any, productId: number, price: number): Promise<ProductTracking[]> => {
  try {
    const trackedInfo = await dataSource.getRepository(ProductTracking).createQueryBuilder('pt').where("pt.productId =:productId", { productId })
      .andWhere("pt.targetPrice >= :price", { price }).getMany();
    return trackedInfo;
  } catch (error) {
    console.log("error fetching products", error);
    return [];
  }
}

export const insertPriceTrackingInfo = async (dataSource: any, priceTracking: PriceTracking[]): Promise<number> => {
  let insertInfo;
  try {
    insertInfo = await dataSource.createQueryBuilder().insert().into(PriceTracking).orIgnore().values(priceTracking).execute();
    return insertInfo.raw.affectedRows;
  } catch (error) {
    return 0;
  }

}