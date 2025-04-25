import { Module } from "@nestjs/common";
import { ReportsService } from "./services/reports.service";
import { ReportsController } from "./controllers/reports.controller";
import { UserModule } from "../user/user.module";
import { QueryHistoryModule } from "../query-history/query-history.module";

@Module({
  imports: [UserModule, QueryHistoryModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
