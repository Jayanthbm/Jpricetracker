import "reflect-metadata"
import { DataSource } from "typeorm"
import { PriceTracking } from "./entity/PriceTracking"
import { Products } from "./entity/Products"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "pricetracker",
    synchronize: true,
    logging: false,
    entities: [Products,PriceTracking],
    migrations: [],
    subscribers: [],
})
