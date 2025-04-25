import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { QueryHistoryRepository } from "../repositories/query-history.repository";
import { PageDto } from "@/common";
import { QueryHistory } from "../entities/query-history.entity";
import to from "await-to-js";
import { FiltersQueryHistoryDto } from "../schemas/query-history.schema";

@Injectable()
export class QueryHistoryService {
  constructor(
    private readonly queryHistoryRepository: QueryHistoryRepository,
  ) {}

  async logQuery(userId: number, module: string, expirationId?: number): Promise<void> {
    await this.queryHistoryRepository.logQuery(userId, module, expirationId);
  }

  async findAll(
    pageOptionsDto: FiltersQueryHistoryDto,
  ): Promise<PageDto<QueryHistory>> {
    try {
      const [error, data] = await to(
        this.queryHistoryRepository.findAll(pageOptionsDto),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getModules(): Promise<string[]> {
    return [
      "Registro inicial",
      "RTM",
      "SOAT",
      "LICENCIA DE CONDUCCIÓN",
      "Historial vehicular",
    ];
  }


  async countLogsForCurrentMonth(
    userId: number,
    module: string,
  ): Promise<number> {
    return await this.queryHistoryRepository.countLogsForCurrentMonth(userId, module);
  }

}
