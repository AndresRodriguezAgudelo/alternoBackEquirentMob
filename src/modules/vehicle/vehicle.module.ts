import { forwardRef, Module } from "@nestjs/common";
import { VehicleService } from "./services/vehicle.service";
import { VehicleController } from "./controllers/vehicle.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vehicle } from "./entities/vehicle.entity";
import { VehicleRepository } from "./repositories/vehicle.repository";
import { DocumentTypeModule } from "../document-type/document-type.module";
import { UserVehicleRepository } from "./repositories/userVehicle.repository";
import { UserVehicle } from "../user-vehicle/entities/userVehicle.entity";
import { RuntModule } from "@/config/runt/runt.module";
import { ExpirationModule } from "../expiration/expiration.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, UserVehicle]),
    DocumentTypeModule,
    RuntModule,
    forwardRef(() => ExpirationModule),
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository, UserVehicleRepository],
  exports: [VehicleService],
})
export class VehicleModule {}
