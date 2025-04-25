import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { Insurer } from "../entities/insurer.entity";
import { UpdateInsurerDto } from "../schemas/insurer.schema";
import { IInsurer } from "@/interfaces/insurer.interface";

@Injectable()
export class InsurerRepository {
  constructor(
    @InjectRepository(Insurer)
    private readonly repository: Repository<Insurer>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(Insurer: Insurer): Promise<Insurer> {
    return this.repository.save(Insurer);
  }

  public async findOne(data: IInsurer): Promise<Insurer> {
    const Insurer = await this.repository.findOne({
      where: { ...data },
    });
    return Insurer;
  }

  public async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Insurer>> {
    const queryBuilder = this.repository.createQueryBuilder("insurer");
    queryBuilder
      .select(["insurer.id", "insurer.nameInsurer"])
      .orderBy("insurer.nameInsurer", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search) {
      queryBuilder.andWhere("LOWER(insurer.nameInsurer) LIKE LOWER(:search)", {
        search: `%${pageOptionsDto.search}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const products = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(products, pageMetaDto);
  }

  async update(
    id: number,
    updateInsurerDto: UpdateInsurerDto,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    let transactionStarted = false;

    try {
      await queryRunner.startTransaction();
      transactionStarted = true;

      const insurer = await queryRunner.manager.findOne(Insurer, {
        where: { id },
      });

      if (!insurer) {
        throwCustomError("insurer_not_found");
      }

      const existingInsurer = await queryRunner.manager.findOne(Insurer, {
        where: { nameInsurer: updateInsurerDto.nameInsurer },
      });

      if (existingInsurer && existingInsurer.id !== id) {
        throwCustomError("insurer_exists");
      }

      insurer.nameInsurer = updateInsurerDto.nameInsurer;

      await queryRunner.manager.save(insurer);
      await queryRunner.commitTransaction();

      return "Aseguradora actualizada correctamente";
    }catch (error) {
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
    const Insurer = await this.findOne({ id });

    if (!Insurer) {
      throwCustomError("insurer_not_found");
    }
    return await this.repository.delete(id);
  }
}
