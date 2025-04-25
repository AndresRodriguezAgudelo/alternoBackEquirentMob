import { Module } from "@nestjs/common";
import { OtpService } from "./services/otp.service";
import { OtpController } from "./controllers/otp.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OtpEntity } from "./entities/otp.entity";
import { OtpRepository } from "./repositories/otp.repository";
import { TwilioModule } from "../twilio/twilio.module";
import { User } from "../user/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([OtpEntity, User]), TwilioModule],
  controllers: [OtpController],
  providers: [OtpService, OtpRepository],
  exports: [OtpService],
})
export class OtpModule {}
