import { Exclude } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { Category } from 'src/categories/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  receiptPath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  @JoinColumn({ name: 'userId' })
  @Exclude({ toPlainOnly: true })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Category, (category) => category.id, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;
}
