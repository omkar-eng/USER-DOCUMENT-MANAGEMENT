import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { Document } from './documents.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DocumentsController', () => {
  let documentsController: DocumentsController;
  let documentsService: DocumentsService;

  const mockDocument: Document = {
    id: 1,
    name: 'test-document.pdf',
    type: 'application/pdf',
    status: 'Pending',
    filePath: './uploads/test-document.pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDocumentsService = {
    ingest: jest.fn().mockResolvedValue(mockDocument),
    findAll: jest.fn().mockResolvedValue([mockDocument]),
    findOne: jest.fn(),
    update: jest.fn().mockResolvedValue(mockDocument),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    documentsController = module.get<DocumentsController>(DocumentsController);
    documentsService = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(documentsController).toBeDefined();
    expect(documentsService).toBeDefined();
  });

  it('should ingest a document', async () => {
    const createDocumentDto: CreateDocumentDto = {
      name: 'test-document.pdf',
      type: 'application/pdf',
      filePath: './uploads/test-document.pdf',
    };
    const file = { filename: 'test-document.pdf', mimetype: 'application/pdf' } as Express.Multer.File;
  
    const result = await documentsController.ingest(file, createDocumentDto);
    expect(result).toEqual(mockDocument);
    expect(documentsService.ingest).toHaveBeenCalledWith({
      ...createDocumentDto,
      status: 'Pending',
      filePath: `./uploads/${file.filename}`,
    });
  });

  it('should throw BadRequestException if no file is provided', async () => {
    const createDocumentDto: CreateDocumentDto = {
      name: 'test-document.pdf',
      type: 'application/pdf',
      filePath: './uploads/test-document.pdf',
    };
  
    await expect(documentsController.ingest(null, createDocumentDto)).rejects.toThrow(BadRequestException);
  });
  it('should find all documents', async () => {
    const result = await documentsController.findAll();
    expect(result).toEqual([mockDocument]);
    expect(documentsService.findAll).toHaveBeenCalled();
  });

  it('should find one document by ID', async () => {
    (documentsService.findOne as jest.Mock).mockResolvedValue(mockDocument);

    const result = await documentsController.findOne(1);
    expect(result).toEqual(mockDocument);
    expect(documentsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if document not found', async () => {
    (documentsService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(documentsController.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a document', async () => {
    const updateDocumentDto: UpdateDocumentDto = { name: 'updated-document.pdf' };
    (documentsService.findOne as jest.Mock).mockResolvedValue(mockDocument);

    const result = await documentsController.update(1, updateDocumentDto);
    expect(result).toEqual(mockDocument);
    expect(documentsService.update).toHaveBeenCalledWith(1, updateDocumentDto);
  });

  it('should throw NotFoundException when updating a non-existing document', async () => {
    (documentsService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(documentsController.update(1, {})).rejects.toThrow(NotFoundException);
  });

  it('should remove a document', async () => {
    (documentsService.findOne as jest.Mock).mockResolvedValue(mockDocument);

    await documentsController.remove(1);
    expect(documentsService.remove).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when removing a non-existing document', async () => {
    (documentsService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(documentsController.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should download a document', async () => {
    const res = {
      download: jest.fn(),
    } as any;

    (documentsService.findOne as jest.Mock).mockResolvedValue(mockDocument);

    await documentsController.download(1, res);
    expect(res.download).toHaveBeenCalledWith(mockDocument.filePath, mockDocument.name, expect.any(Function));
  });

  it('should throw NotFoundException when downloading a non-existing document', async () => {
    const res = {
      download: jest.fn(),
    } as any;

    (documentsService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(documentsController.download(1, res)).rejects.toThrow(NotFoundException);
  });

  it('should get status of a document', async () => {
    (documentsService.findOne as jest.Mock).mockResolvedValue(mockDocument);

    const result = await documentsController.getStatus(1);
    expect(result).toEqual({ filePath: mockDocument.filePath, id: mockDocument.id, status: mockDocument.status });
    expect(documentsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when getting status of a non-existing document', async () => {
    (documentsService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(documentsController.getStatus(1)).rejects.toThrow(NotFoundException);
  });
});