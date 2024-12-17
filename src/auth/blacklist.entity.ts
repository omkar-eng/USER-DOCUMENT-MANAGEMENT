import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'blacklist'})
export class BlacklistedTokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;
}