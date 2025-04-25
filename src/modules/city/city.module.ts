import { Module } from "@nestjs/common";
import { CityService } from "./services/city.service";
import { CityController } from "./controllers/city.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { City } from "./entities/city.entity";
import { CityRepository } from "./repositories/city.repository";

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  controllers: [CityController],
  providers: [CityService, CityRepository],
  exports: [CityService],
})
export class CityModule {}
