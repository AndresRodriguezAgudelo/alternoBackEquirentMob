import { Module } from "@nestjs/common";
import { QueryHistoryService } from "./services/query-history.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QueryHistory } from "./entities/query-history.entity";
import { QueryHistoryRepository } from "./repositories/query-history.repository";
import { QueryHistoryController } from "./controllers/query-history.controller";

@Module({
  imports: [TypeOrmModule.forFeature([QueryHistory])],
  controllers: [QueryHistoryController],
  providers: [QueryHistoryService, QueryHistoryRepository],
  exports: [QueryHistoryService],
})
export class QueryHistoryModule {}
