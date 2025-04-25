import { Module } from "@nestjs/common";
import { InsurerService } from "./services/insurer.service";
import { InsurerController } from "./controllers/insurer.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Insurer } from "./entities/insurer.entity";
import { InsurerRepository } from "./repositories/insurer.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Insurer])],
  controllers: [InsurerController],
  providers: [InsurerService, InsurerRepository],
  exports: [InsurerService],
})
export class InsurerModule {}
