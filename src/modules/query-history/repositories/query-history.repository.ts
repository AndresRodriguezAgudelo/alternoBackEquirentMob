import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { QueryHistory } from "../entities/query-history.entity";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { FiltersQueryHistoryDto } from "../schemas/query-history.schema";

@Injectable()
export class QueryHistoryRepository {
  constructor(
    @InjectRepository(QueryHistory)
    private readonly repository: Repository<QueryHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async logQuery(userId: number, module: string, expirationId?: number): Promise<void> {
    const history = this.repository.create({
      userId,
      module,
      expirationId,
    });
    await this.repository.save(history);
  }

  public async findAll(
    pageOptionsDto: FiltersQueryHistoryDto,
  ): Promise<PageDto<QueryHistory>> {
    const queryBuilder = this.repository.createQueryBuilder("query_history");
    queryBuilder
      .select([
        "query_history.id",
        "query_history.module",
        "user.name",
        "query_history.createdAt",
      ])
      .leftJoin("query_history.user", "user")
      .orderBy("query_history.id", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search) {
      queryBuilder.andWhere("LOWER(query_history.module) LIKE LOWER(:search)", {
        search: `%${pageOptionsDto.search}%`,
      });
    }

    if (pageOptionsDto.startDate && pageOptionsDto.endDate) {
      queryBuilder.andWhere("user.createdAt BETWEEN :startDate AND :endDate", {
        startDate: pageOptionsDto.startDate,
        endDate: pageOptionsDto.endDate,
      });
    }

    const total = await queryBuilder.getCount();
    const products = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(products, pageMetaDto);
  }

  async countLogsForCurrentMonth(
    userId: number,
    module: string,
  ): Promise<number> {
    const now = new Date();
    const currentYear = now.getFullYear();
    // getMonth() retorna 0 para enero, por ello sumamos 1
    const currentMonth = now.getMonth() + 1;

    const result = await this.repository
      .createQueryBuilder("qh")
      .select("COUNT(qh.id)", "total")
      .where("qh.userId = :userId", { userId })
      .andWhere("qh.module = :module", { module })
      .andWhere("YEAR(qh.createdAt) = :year", { year: currentYear })
      .andWhere("MONTH(qh.createdAt) = :month", { month: currentMonth })
      .getRawOne();

    return Number(result.total);
  }
  

}
