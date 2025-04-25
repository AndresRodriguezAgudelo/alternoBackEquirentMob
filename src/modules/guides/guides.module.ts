import { Module } from "@nestjs/common";
import { GuidesService } from "./services/guides.service";
import { GuidesController } from "./controllers/guides.controller";
import { FilesModule } from "../files/files.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Guides } from "./entities/guides.entity";
import { GuidesRepository } from "./repositories/guides.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Guides]), FilesModule],
  controllers: [GuidesController],
  providers: [GuidesService, GuidesRepository],
})
export class GuidesModule {}
