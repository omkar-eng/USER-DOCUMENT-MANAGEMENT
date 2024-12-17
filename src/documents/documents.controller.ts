import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    NotFoundException,
    Logger,
    Res,
  } from '@nestjs/common';
  import { DocumentsService } from './documents.service';
  import { Document } from './documents.entity';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname, join } from 'path';
  import { CreateDocumentDto } from '../dto/create-document.dto';
  import { UpdateDocumentDto } from '../dto/update-document.dto';
  import { Response } from 'express';
  
  @Controller('documents')
  export class DocumentsController {
    private readonly logger = new Logger(DocumentsController.name);
  
    constructor(private readonly documentsService: DocumentsService) {}
  
    @Post('ingest')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        }
      })
    }))
    async ingest(@UploadedFile() file: Express.Multer.File, @Body() body: CreateDocumentDto): Promise<Document> {
      if (!file) {
        this.logger.error('File is required for document creation');
        throw new BadRequestException('File is required');
      }
  
      const filePath = `./uploads/${file.filename}`;
      const documentData: CreateDocumentDto = {
        name: file.filename,
        type: file.mimetype,
        status: 'Pending',
        filePath,
        ...body,
      };
      this.logger.log(`Triggering ingestion for document with data: ${JSON.stringify(documentData)}`);
      return this.documentsService.ingest(documentData);
    }
  
    @Get()
    async findAll(): Promise<Document[]> {
      this.logger.log('Fetching all documents');
      return this.documentsService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Document> {
      this.logger.log(`Fetching document with ID: ${id}`);
      const document = await this.documentsService.findOne(id);
      if (!document) {
        this.logger.warn(`Document with ID ${id} not found`);
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      return document;
    }
  
    @Put(':id')
    async update(@Param('id') id: number, @Body() documentData: UpdateDocumentDto): Promise<Document> {
      this.logger.log(`Updating document with ID: ${id}`);
      const document = await this.documentsService.findOne(id);
      if (!document) {
        this.logger.warn(`Document with ID ${id} not found for update`);
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      return this.documentsService.update(id, documentData);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
      this.logger.log(`Removing document with ID: ${id}`);
      const document = await this.documentsService.findOne(id);
      if (!document) {
        this.logger.warn(`Document with ID ${id} not found for removal`);
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      return this.documentsService.remove(id);
    }

    @Get('/download/:id')
  async download(@Param('id') id: number, @Res() res: Response): Promise<void> {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      this.logger.error(`Document with ID ${id} not found for download`);
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const filePath = document.filePath;
    this.logger.log(`Downloading file for document ID: ${id}`);
    res.download(filePath, document.name, (err) => {
      if (err) {
        this.logger.error(`Error downloading file: ${err.message}`);
        res.status(400).end(err.message);
      }
    });
  }


  @Get('/status/:id')
  async getStatus(@Param('id') id: number): Promise<{filePath, id, status}> {
    this.logger.log(`Received request to get status for document ID: ${id}`);
    const document = await this.documentsService.findOne(id);
    if (!document) {
      this.logger.error(`Document with ID ${id} not found`);
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return {filePath: document.filePath, id: document.id, status: document.status}
  }
  }