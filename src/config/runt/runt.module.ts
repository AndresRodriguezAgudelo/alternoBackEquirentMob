import { Module } from "@nestjs/common";
import { RuntService } from "./runt.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  providers: [RuntService],
  exports: [RuntService],
})
export class RuntModule {}
