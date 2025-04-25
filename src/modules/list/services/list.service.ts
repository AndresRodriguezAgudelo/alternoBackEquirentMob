import { DataSource, Repository } from "typeorm";
import { ListOrder } from "../entities/list.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, BadRequestException } from "@nestjs/common";
import {
  UpdateListOrderDto,
  UpdateListOrderSchema,
} from "../schemas/list.schemas";

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(ListOrder)
    private readonly listOrderRepository: Repository<ListOrder>,
    private readonly dataSource: DataSource,
  ) {}

  async upsertListOrder(dto: UpdateListOrderDto): Promise<void> {
    console.log("Entrada", dto);

    // Validación con Zod
    const parsedData = UpdateListOrderSchema.parse(dto);

    // Verificar si cada ID en orderIds existe en la tabla servicing
    const missingIds = await this.getNonExistentIds(parsedData.orderIds);
    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Los siguientes IDs no existen en servicios: ${missingIds.join(", ")}`,
      );
    }

    const orders = await this.listOrderRepository.find({
      order: { id: "ASC" },
      take: 1,
    });
    const existingOrder: ListOrder | null =
      orders.length > 0 ? orders[0] : null;

    console.log("existingOrder", existingOrder);

    if (existingOrder) {
      existingOrder.orderIds = parsedData.orderIds;
      await this.listOrderRepository.save(existingOrder);
      console.log("Registro actualizado:", existingOrder);
    } else {
      const newOrder = this.listOrderRepository.create({
        orderIds: parsedData.orderIds,
      });
      await this.listOrderRepository.save(newOrder);
      console.log("Registro creado:", newOrder);
    }
  }

  private async getNonExistentIds(orderIds: number[]): Promise<number[]> {
    const existingIds = await this.dataSource
      .getRepository("servicing")
      .createQueryBuilder("s")
      .select("s.id")
      .where("s.id IN (:...orderIds)", { orderIds })
      .getMany();

    const foundIds = new Set(existingIds.map((s: { id: number }) => s.id));
    return orderIds.filter((id) => !foundIds.has(id));
  }

  getOrderIds(): Promise<ListOrder[]> {
    return this.listOrderRepository.find();
  }
}
