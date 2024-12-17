import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsString()
  filePath: string;
}