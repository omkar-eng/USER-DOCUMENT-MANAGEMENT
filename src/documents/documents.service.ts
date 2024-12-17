// document.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from '../dto/create-document.dto';
import {Document} from './documents.entity'
import { UpdateDocumentDto } from '../dto/update-document.dto';

@Injectable()
export class DocumentsService {
    private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async ingest(documentData: Partial<Document>): Promise<Document> {
    const document = this.documentRepository.create(documentData);
    document.createdAt = new Date();
    document.updatedAt = new Date();
    document.status = 'Uploaded'
    this.logger.log(`Ingesting document: ${JSON.stringify(document)}`);
    return this.documentRepository.save(document);
  }

  async findAll(): Promise<Document[]> {
    this.logger.log('Fetching all documents');
    return this.documentRepository.find();
  }

  async findOne(id: number): Promise<Document> {
    this.logger.log(`Fetching document with ID: ${id}`);
    return this.documentRepository.findOneBy({ id });
  }

  async update(id: number, documentData: Partial<Document>): Promise<Document> {
    this.logger.log(`Updating document with ID: ${id}`);
    await this.documentRepository.update(id, documentData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing document with ID: ${id}`);
    await this.documentRepository.delete(id);
  }
}