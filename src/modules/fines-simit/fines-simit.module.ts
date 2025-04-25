import { Module } from "@nestjs/common";
import { FinesSimitService } from "./services/fines-simit.service";
import { FinesSimitController } from "./controllers/fines-simit.controller";
import { QueryHistoryModule } from "../query-history/query-history.module";

@Module({
  imports: [QueryHistoryModule],
  controllers: [FinesSimitController],
  providers: [FinesSimitService],
  exports: [FinesSimitService],
})
export class FinesSimitModule {}
