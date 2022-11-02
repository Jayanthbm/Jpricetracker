import "reflect-metadata"
import { DataSource } from "typeorm"
import { PriceTracking } from "./entity/price-tracking.entity"
import { ProductTracking } from "./entity/product-tracking.entity"
import { Products } from "./entity/products.entity"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "pricetracker",
    synchronize: true,
    logging: false,
    entities: [Products, PriceTracking, ProductTracking],
    migrations: [],
    subscribers: [],
})
