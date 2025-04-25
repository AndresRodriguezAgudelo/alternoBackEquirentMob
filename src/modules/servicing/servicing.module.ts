import { Module } from "@nestjs/common";
import { ServicingService } from "./services/servicing.service";
import { ServicingController } from "./controllers/servicing.controller";
import { Servicing } from "./entities/servicing.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServicingRepository } from "./repositories/servicing.repository";
import { FilesModule } from "../files/files.module";
import { ListModule } from "../list/list.module";

@Module({
  imports: [TypeOrmModule.forFeature([Servicing]), FilesModule, ListModule],
  controllers: [ServicingController],
  providers: [ServicingService, ServicingRepository],
})
export class ServicingModule {}
