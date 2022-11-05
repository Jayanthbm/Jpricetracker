import "reflect-metadata"
import { DataSource } from "typeorm"
import { PriceTracking } from "./entity/price-tracking.entity"
import { ProductTracking } from "./entity/product-tracking.entity"
import { Products } from "./entity/products.entity"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [Products, PriceTracking, ProductTracking],
    migrations: [],
    subscribers: [],
})
