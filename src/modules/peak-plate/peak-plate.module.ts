import { Module } from "@nestjs/common";
import { PeakPlateService } from "./services/peak-plate.service";
import { PeakPlateController } from "./controllers/peak-plate.controller";
import { PeakPlateRepository } from "./repositories/peak-plate.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PeakPlateRestriction } from "./entities/peak-plate.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PeakPlateRestriction])],
  controllers: [PeakPlateController],
  providers: [PeakPlateService, PeakPlateRepository],
  exports: [PeakPlateService],
})
export class PeakPlateModule {}
