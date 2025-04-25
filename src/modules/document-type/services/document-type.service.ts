import { HttpException, HttpStatus, Injectable, Query } from "@nestjs/common";
import { DocumentTypeRepository } from "../repositories/document-type.repository";
import {
  CreateDocumentDto,
  UpdateDocumentDto,
} from "../schemas/document-type.schema";
import { DocumentType } from "../entities/document-type.entity";
import to from "await-to-js";
import { PageDto, PageOptionsDto } from "@/common";

@Injectable()
export class DocumentTypeService {
  constructor(private readonly documentRepository: DocumentTypeRepository) {}

  async create(body: CreateDocumentDto): Promise<DocumentType> {
    try {
      const existingDocument = await this.documentRepository.findOne({
        typeName: body.typeName,
      });
      if (existingDocument) {
        throw new HttpException(
          "El tipo de documento ya existe",
          HttpStatus.BAD_REQUEST,
        );
      }
      const document = new DocumentType();
      document.typeName = body.typeName;

      const [error, newDocument] = await to(
        this.documentRepository.save(document),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return newDocument;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<DocumentType>> {
    try {
      const [error, data] = await to(
        this.documentRepository.findAll(pageOptionsDto),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const Document = await this.documentRepository.findOne({ id });
      if (!Document) {
        throw new HttpException(
          "Tipo de documento no encontrado",
          HttpStatus.NOT_FOUND,
        );
      }
      return Document;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateDocumentDto): Promise<string> {
    try {
      const [error, data] = await to(this.documentRepository.update(id, dto));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const [error, data] = await to(this.documentRepository.remove(id));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
