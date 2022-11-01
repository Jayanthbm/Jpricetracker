import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Products } from "./Products";

@Entity()
export class PriceTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double' })
  fetchedPrice: number;

  @Column({ type: 'boolean', nullable: false })
  priceDecreased: boolean;

  @Column({ type: 'double' })
  priceDifference: number;

  @Column({ type: 'boolean', default: false })
  outOfStock: boolean;

  @ManyToOne(() => Products, (products) => products.trackedPrice)
  product: Products

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}