import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { storesEnum } from "../enums/allEnums";
import { ProductTracking } from "./product-tracking.entity";
import { PriceTracking } from "./price-tracking.entity";

@Entity()
export class Products {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  url: string;

  @Column({ type: 'varchar', nullable: true })
  productName: string;

  @Column({ type: 'double', nullable: false })
  price: number;

  @Column({ type: 'enum', enum: storesEnum, default: storesEnum.flipkart })
  store: storesEnum

  @CreateDateColumn({ select: false })
  createdAt: string;

  @UpdateDateColumn({ select: false })
  updatedAt: string;

  @OneToMany(() => PriceTracking, (price) => price.product)
  trackedPrice: PriceTracking[]

  @OneToMany(() => ProductTracking, (track) => track.product)
  trackedProduct: ProductTracking[]
}