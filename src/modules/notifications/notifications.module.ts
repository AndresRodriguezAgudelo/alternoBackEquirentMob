import { Module } from "@nestjs/common";
import { NotificationsController } from "./controllers/notifications.controller";
import { NotificationsRepository } from "./repositories/notifications.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceRegistration } from "./entities/device-registration.entity";
import { NotificationService } from "./services/notifications.service";

@Module({
  imports: [TypeOrmModule.forFeature([DeviceRegistration])],
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationsRepository],
  exports: [NotificationService],
})
export class NotificationsModule {}
