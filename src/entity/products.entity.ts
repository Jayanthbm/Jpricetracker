import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { storesEnum } from "../enums/allEnums";
import { PriceTracking } from "./price-tracking.entity";

@Entity()
export class Products {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false, unique: true })
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
}