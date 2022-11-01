import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { storesEnum } from "../enums/allEnums";
import { PriceTracking } from "./PriceTracking";

@Entity()
export class Products {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false, unique: true })
  url: string;

  @Column({ type: 'double', nullable: false })
  price: number;

  @Column({ type: 'double', nullable: false })
  targetPrice: number;

  @Column({ type: 'enum',enum:storesEnum ,default:storesEnum.flipkart})
  store: storesEnum

  @Column({ type: 'varchar', nullable: true })
  productName: string;

  @Column({ type: 'boolean', default: true })
  notify: boolean

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  mobile: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToMany(() => PriceTracking, (price) => price.product)
  trackedPrice :PriceTracking[]
}