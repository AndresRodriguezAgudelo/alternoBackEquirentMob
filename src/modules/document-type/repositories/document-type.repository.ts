import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { DocumentType } from "../entities/document-type.entity";
import { IDocumentType } from "@/interfaces/document.interface";
import { UpdateDocumentDto } from "../schemas/document-type.schema";

@Injectable()
export class DocumentTypeRepository {
  constructor(
    @InjectRepository(DocumentType)
    private readonly repository: Repository<DocumentType>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(DocumentType: DocumentType): Promise<DocumentType> {
    return this.repository.save(DocumentType);
  }

  public async findOne(data: IDocumentType): Promise<DocumentType> {
    const DocumentType = await this.repository.findOne({
      where: { ...data },
    });
    return DocumentType;
  }

  public async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<DocumentType>> {
    const queryBuilder = this.repository.createQueryBuilder("document_type");
    queryBuilder
      .select(["document_type.id", "document_type.typeName"])
      .orderBy("document_type.typeName", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search) {
      queryBuilder.andWhere(
        "LOWER(document_type.typeName) LIKE LOWER(:search)",
        { search: `%${pageOptionsDto.search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const products = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(products, pageMetaDto);
  }

  async update(
    id: number,
    updateDocumentTypeDto: UpdateDocumentDto,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    let transactionStarted = false;

    try {
      await queryRunner.startTransaction();
      transactionStarted = true;

      const documentType = await queryRunner.manager.findOne(DocumentType, {
        where: { id },
      });

      if (!documentType) {
        throwCustomError("document_not_found");
      }

      const existingDocumentType = await queryRunner.manager.findOne(
        DocumentType,
        {
          where: { typeName: updateDocumentTypeDto.typeName },
        },
      );

      if (existingDocumentType && existingDocumentType.id !== id) {
        throwCustomError("document_exists");
      }

      documentType.typeName = updateDocumentTypeDto.typeName;

      await queryRunner.manager.save(documentType);
      await queryRunner.commitTransaction();

      return "Tipo de documento actualizado correctamente";
    } catch (error) {
       if (transactionStarted) {
        await queryRunner.rollbackTransaction();
      }
      if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw error;
      }
    } finally {
     if (transactionStarted) {
        await queryRunner.release();
      }
    }
  }

  public async remove(id: number): Promise<any> {
    const DocumentType = await this.findOne({ id });

    if (!DocumentType) {
      throwCustomError("document_not_found");
    }
    return await this.repository.delete(id);
  }
}
