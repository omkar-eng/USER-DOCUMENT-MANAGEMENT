import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users'})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: string; // 'admin', 'editor', 'viewer'

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
