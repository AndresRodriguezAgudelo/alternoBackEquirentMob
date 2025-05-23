import { Module } from "@nestjs/common";
import { TwilioService } from "./service/twilio.service";
@Module({
  controllers: [],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
