// documents.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './documents.entity';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;

  const mockDocumentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ingest', () => {
    it('should successfully ingest a document', async () => {
      const documentData: Partial<Document> = { name: 'Test Document', type: 'pdf', filePath: '/path/to/document.pdf' };
      const createdDocument = { ...documentData, id: 1, createdAt: new Date(), updatedAt: new Date(), status: 'Uploaded' };

      mockDocumentRepository.create.mockReturnValue(createdDocument);
      mockDocumentRepository.save.mockResolvedValue(createdDocument);

      const result = await service.ingest(documentData);
      expect(result).toEqual(createdDocument);
      expect(mockDocumentRepository.create).toHaveBeenCalledWith(documentData);
      expect(mockDocumentRepository.save).toHaveBeenCalledWith(createdDocument);
    });

    it('should throw an error if saving fails', async () => {
      const documentData: Partial<Document> = { name: 'Test Document', type: 'pdf', filePath: '/path/to/document.pdf' };
      const createdDocument = { ...documentData, id: 1, createdAt: new Date(), updatedAt: new Date(), status: 'Uploaded' };

      mockDocumentRepository.create.mockReturnValue(createdDocument);
      mockDocumentRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.ingest(documentData)).rejects.toThrow('Save failed');
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const documents = [
        { id: 1, name: 'Document 1', type: 'pdf', status: 'Pending', createdAt: new Date(), updatedAt: new Date(), filePath: '/path/to/document1.pdf' },
        { id: 2, name: 'Document 2', type: 'docx', status: 'Pending', createdAt: new Date(), updatedAt: new Date(), filePath: '/path/to/document2.docx' },
      ];
      mockDocumentRepository.find.mockResolvedValue(documents);

      const result = await service.findAll();
      expect(result).toEqual(documents);
      expect(mockDocumentRepository.find).toHaveBeenCalled();
    });

    it('should return an empty array if no documents exist', async () => {
      mockDocumentRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a document by ID', async () => {
      const document = { id: 1, name: 'Document 1', type: 'pdf', status: 'Pending', createdAt: new Date(), updatedAt: new Date(), filePath: '/path/to/document1.pdf' };
      mockDocumentRepository.findOneBy.mockResolvedValue(document);

      const result = await service.findOne(1);
      expect(result).toEqual(document);
      expect(mockDocumentRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null if document not found', async () => {
      mockDocumentRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a document and return the updated document', async () => {
      const documentData: Partial<Document> = { name: 'Updated Document', type: 'pdf', filePath: '/path/to/updated_document.pdf' };
      const updatedDocument = { id: 1, ...documentData, status: 'Pending', createdAt: new Date(), updatedAt: new Date() };

      mockDocumentRepository.update.mockResolvedValue(undefined);
      mockDocumentRepository.findOneBy.mockResolvedValue(updatedDocument);

      const result = await service.update(1, documentData);
      expect(result).toEqual(updatedDocument);
      expect(mockDocumentRepository.update).toHaveBeenCalledWith(1, documentData);
    });

    it('should throw an error if document update fails', async () => {
      const documentData: Partial<Document> = { name: 'Updated Document' };

      mockDocumentRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(service.update(1, documentData)).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should successfully remove a document', async () => {
      mockDocumentRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if document removal fails', async () => {
      mockDocumentRepository.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(service.remove(1)).rejects.toThrow('Delete failed');
    });
  });
});