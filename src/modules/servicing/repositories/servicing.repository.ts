import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { Servicing } from "../entities/servicing.entity";
import { UpdateServicingDto } from "../schemas/servicing.schema";
import { ListService } from "@/modules/list/services/list.service";

@Injectable()
export class ServicingRepository {
  constructor(
    @InjectRepository(Servicing)
    private readonly repository: Repository<Servicing>,
    private readonly dataSource: DataSource,
    private readonly listService: ListService,
  ) {}

  public async save(servicing: Servicing): Promise<Servicing> {
    return this.repository.save(servicing);
  }

  public async findOne(data: Partial<Servicing>): Promise<Servicing> {
    const servicing = await this.repository.findOne({
      where: { ...data },
    });
    return servicing;
  }

  public async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Servicing>> {
    const orders = await this.listService.getOrderIds();
    console.log("orders", orders);

    const queryBuilder = this.repository.createQueryBuilder("servicing");

    queryBuilder.select([
      "servicing.id",
      "servicing.name",
      "servicing.link",
      "servicing.description",
      "servicing.key",
    ]);

    if (
      orders &&
      orders.length > 0 &&
      orders[0].orderIds &&
      orders[0].orderIds.length > 0
    ) {
      const orderIds: number[] = orders[0].orderIds;
      const orderCase = `CASE servicing.id ${orderIds
        .map((id, index) => `WHEN ${id} THEN ${index}`)
        .join(" ")} ELSE ${orderIds.length} END`;
      queryBuilder.orderBy(orderCase, "ASC");
    } else {
      queryBuilder.orderBy("servicing.name", pageOptionsDto.order);
    }

    if (pageOptionsDto.search) {
      queryBuilder.andWhere("LOWER(servicing.name) LIKE LOWER(:search)", {
        search: `%${pageOptionsDto.search}%`,
      });
    }

    queryBuilder
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });
    return new PageDto(items, pageMetaDto);
  }

  async update(
    id: number,
    updateServicingDto: UpdateServicingDto,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const servicing = await queryRunner.manager.findOne(Servicing, {
        where: { id },
      });

      if (!servicing) {
        await queryRunner.rollbackTransaction();
        throwCustomError("servicing_not_found");
      }

      queryRunner.manager.merge(Servicing, servicing, updateServicingDto);

      await queryRunner.manager.save(servicing);
      await queryRunner.commitTransaction();

      return "Servicio actualizado correctamente";
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwCustomError("servicing_error");
    } finally {
      await queryRunner.release();
    }
  }

  public async delete(id: number): Promise<any> {
    const servicing = await this.findOne({ id });

    if (!servicing) {
      throwCustomError("servicing_not_found");
    }
    return await this.repository.delete(id);
  }
}
