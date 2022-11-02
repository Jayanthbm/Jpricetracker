import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Products } from "./products.entity";

@Entity()
@Index(['email', 'product'], { unique: true })
export class ProductTracking {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double', nullable: false })
  targetPrice: number;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  mobile: string;

  @ManyToOne(() => Products, (products) => products.trackedProduct)
  product: Products

  @CreateDateColumn({ select: false })
  createdAt: string;

  @UpdateDateColumn({ select: false })
  updatedAt: string;


}