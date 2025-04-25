import { Module } from "@nestjs/common";
import { ExpirationCronService } from "./services/expiration-cron.service";
import { ExpirationCronController } from "./controllers/expiration-cron.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExpirationCron } from "./entities/expiration-cron.entity";
import { Reminder } from "../reminder/entities/reminder.entity";
import { Expiration } from "../expiration/entities/expiration.entity";
import { TwilioModule } from "../twilio/twilio.module";
import { ScheduleModule } from "@nestjs/schedule";
import { VehicleModule } from "../vehicle/vehicle.module";
import { UserVehicle } from "../user-vehicle/entities/userVehicle.entity";
import { User } from "../user/entities/user.entity";
import { ExpirationCronRepository } from "./repositories/expiration-cron.repository";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpirationCron,
      Reminder,
      Expiration,
      UserVehicle,
      User,
    ]),
    TwilioModule,
    ScheduleModule.forRoot(),
    VehicleModule,
    NotificationsModule,
  ],
  controllers: [ExpirationCronController],
  providers: [ExpirationCronService, ExpirationCronRepository],
})
export class ExpirationCronModule {}
