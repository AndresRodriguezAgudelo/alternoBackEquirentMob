import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ExpirationCron } from "../entities/expiration-cron.entity";
import { Repository, Between } from "typeorm";

@Injectable()
export class ExpirationCronRepository {
  constructor(
    @InjectRepository(ExpirationCron)
    private readonly repo: Repository<ExpirationCron>,
  ) {}

  async findNotification(
    expirationId: number,
    reminderDays: number,
    startDay: Date,
    endDay: Date,
    type: string,
  ): Promise<ExpirationCron | undefined> {
    return await this.repo.findOne({
      where: {
        expirationId,
        reminderDays,
        notifiedAt: Between(startDay, endDay),
        type,
      },
    });
  }

  async createNotification(
    notificationData: Partial<ExpirationCron>,
  ): Promise<ExpirationCron> {
    const notification = this.repo.create(notificationData);
    return await this.repo.save(notification);
  }
}
