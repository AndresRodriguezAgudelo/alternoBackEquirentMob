import { forwardRef, Module } from "@nestjs/common";
import { ExpirationService } from "./services/expiration.service";
import { ExpirationController } from "./controllers/expiration.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Expiration } from "./entities/expiration.entity";
import { ExpirationRepository } from "./repository/expiration.repository";
import { ReminderModule } from "../reminder/reminder.module";
import { VehicleModule } from "../vehicle/vehicle.module";
import { InsurerModule } from "../insurer/insurer.module";
import { RuntModule } from "@/config/runt/runt.module";
import { FinesSimitModule } from "../fines-simit/fines-simit.module";
import { PeakPlateModule } from "../peak-plate/peak-plate.module";
import { UserModule } from "../user/user.module";
import { QueryHistoryModule } from "../query-history/query-history.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Expiration]),
    ReminderModule,
    forwardRef(() => VehicleModule),
    InsurerModule,
    RuntModule,
    FinesSimitModule,
    PeakPlateModule,
    UserModule,
    QueryHistoryModule

  ],
  controllers: [ExpirationController],
  providers: [ExpirationService, ExpirationRepository],
  exports: [ExpirationService],
})
export class ExpirationModule {}
