import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Products } from "./products.entity";

@Entity()
export class PriceTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double' })
  fetchedPrice: number;

  @Column({ type: 'boolean', default: false })
  outOfStock: boolean;

  @ManyToOne(() => Products, (products) => products.trackedPrice)
  product: Products

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn({ select: false })
  updatedAt: string;
}