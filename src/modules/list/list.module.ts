import { Module } from "@nestjs/common";
import { ListService } from "./services/list.service";
import { ListController } from "./controllers/list.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListOrder } from "./entities/list.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ListOrder])],
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],
})
export class ListModule {}
