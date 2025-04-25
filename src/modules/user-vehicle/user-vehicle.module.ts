import { Module } from "@nestjs/common";
import { UserVehicleService } from "./services/user-vehicle.service";
import { UserVehicleController } from "./controllers/user-vehicle.controller";

@Module({
  controllers: [UserVehicleController],
  providers: [UserVehicleService],
})
export class UserVehicleModule {}
