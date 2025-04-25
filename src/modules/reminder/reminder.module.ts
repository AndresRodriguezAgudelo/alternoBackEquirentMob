import { Module } from "@nestjs/common";
import { ReminderService } from "./services/reminder.service";
import { ReminderController } from "./controllers/reminder.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reminder } from "./entities/reminder.entity";
import { ReminderRepository } from "./repositories/reminder.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Reminder])],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository],
  exports: [ReminderService],
})
export class ReminderModule {}
