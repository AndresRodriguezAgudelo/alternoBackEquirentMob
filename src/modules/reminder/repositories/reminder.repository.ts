import { In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { Reminder } from "../entities/reminder.entity";
import { UpdateReminderDto } from "../schemas/reminder.schema";

@Injectable()
export class ReminderRepository {
  constructor(
    @InjectRepository(Reminder)
    private readonly repository: Repository<Reminder>,
  ) {}

  
  async deleteManyByDaysAndExpirationId(days: number[], expirationId: number): Promise<void> {
    await this.repository.delete({
      expirationId,
      days: In(days),
    });
  }
  

  public async save(reminder: Reminder): Promise<Reminder> {
    const savedReminder = await this.repository.save(reminder);
    return this.findOne({ id: savedReminder.id });
  }

  public async findOne(data: Partial<Reminder>): Promise<Reminder> {
    const reminder = await this.repository.findOne({
      where: { ...data },
    });
    return reminder;
  }

  public async findAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Reminder>> {
    const queryBuilder = this.repository.createQueryBuilder("reminders");
    queryBuilder
      .orderBy("reminders.reminderDate", pageOptionsDto.order)
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const total = await queryBuilder.getCount();
    const reminders = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

    return new PageDto(reminders, pageMetaDto);
  }

  public async update(
    id: number,
    updateReminderDto: UpdateReminderDto,
  ): Promise<Reminder> {
    const reminder = await this.findOne({ id });

    if (!reminder) {
      throwCustomError("reminder_not_found");
    }

    reminder.days = updateReminderDto.days;
    return this.repository.save(reminder);
  }

  public async remove(id: number): Promise<any> {
    const reminder = await this.findOne({ id });

    if (!reminder) {
      throwCustomError("reminder_not_found");
    }
    return await this.repository.delete(id);
  }

  public async saveMany(reminders: Reminder[]): Promise<Reminder[]> {
    return this.repository.save(reminders);
  }

  public async findByExpirationId(expirationId: number): Promise<Reminder[]> {
    const reminder = await this.repository.find({ where: { expirationId } });
    if (!reminder) {
      throwCustomError("reminder_not_found");
    }
    return reminder;
  }

  public async deleteByExpirationId(expirationId: number): Promise<any> {
    return await this.repository.delete({ expirationId });
  }
}
