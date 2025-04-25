import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { Guides } from "../entities/guides.entity";

@Injectable()
export class GuidesRepository {
  constructor(
    @InjectRepository(Guides)
    private readonly repository: Repository<Guides>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(guide: Guides): Promise<Guides> {
    return this.repository.save(guide);
  }

  public async findOne(data: Partial<Guides>): Promise<Guides> {
    return this.repository.findOne({ where: { ...data } });
  }

  public async total(): Promise<number> {
    return this.repository.count();
  }

  public async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Guides>> {
    const queryBuilder = this.repository.createQueryBuilder("guides");
    queryBuilder
      .select([
        "guides.id",
        "guides.name",
        "guides.keyMain",
        "guides.keySecondary",
        "guides.keyTertiaryVideo",
        "guides.description",
        "guides.categoryId",
      ])
      .orderBy("guides.name", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search) {
      queryBuilder.andWhere("LOWER(guides.name) LIKE LOWER(:search)", {
        search: `%${pageOptionsDto.search}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(items, pageMetaDto);
  }

  public async findAllApp(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Guides>> {
    const queryBuilder = this.repository.createQueryBuilder("guides");
    queryBuilder
      .select([
        "guides.id",
        "guides.name",
        "guides.keyMain",
        "guides.keySecondary",
        "guides.keyTertiaryVideo",
        "guides.description",
        "guides.categoryId",
        "category.categoryName",
        "guides.createdAt",
      ])
      .leftJoin("guides.category", "category")
      .orderBy("guides.name", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search) {
      queryBuilder.andWhere("LOWER(guides.name) LIKE LOWER(:search)", {
        search: `%${pageOptionsDto.search}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(items, pageMetaDto);
  }

  public async delete(id: number): Promise<any> {
    const guide = await this.findOne({ id });

    if (!guide) {
      throw new Error("Guía no encontrada");
    }

    return await this.repository.delete(id);
  }
}
