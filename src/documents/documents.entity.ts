import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ default: 'Pending' })
  status: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  filePath: string;
}