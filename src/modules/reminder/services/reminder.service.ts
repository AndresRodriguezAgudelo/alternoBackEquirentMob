import { HttpException, HttpStatus, Injectable, Query } from "@nestjs/common";
import { ReminderRepository } from "../repositories/reminder.repository";
import {
  CreateReminderDto,
  UpdateReminderDto,
} from "../schemas/reminder.schema";
import { Reminder } from "../entities/reminder.entity";
import to from "await-to-js";
import { PageDto, PageOptionsDto } from "@/common";

@Injectable()
export class ReminderService {
  constructor(private readonly reminderRepository: ReminderRepository) {}
  
  async findOne(id: number) {
    try {
      const reminder = await this.reminderRepository.findOne({ id });
      if (!reminder) {
        throw new HttpException("Reminder not found", HttpStatus.NOT_FOUND);
      }
      return reminder;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const [error, data] = await to(this.reminderRepository.remove(id));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateReminders(
    remindersDto: UpdateReminderDto[],
    expirationId: number,
  ): Promise<void> {
    if (!remindersDto) return;
  
    // Obtener todos los reminders existentes para la expiración actual
    const existingReminders: Reminder[] = await this.reminderRepository.findByExpirationId(expirationId);
    const existingDays = new Set(existingReminders.map((r) => r.days));
  
    // Obtener los días enviados en la solicitud
    const incomingDays = new Set(remindersDto.map((dto) => dto.days));
  
    // Identificar días que deben ser eliminados (los que existen pero no fueron enviados en la solicitud)
    const daysToDelete = [...existingDays].filter((day) => !incomingDays.has(day));
  
    // Borrar los reminders que ya no están en la nueva lista
    if (daysToDelete.length > 0) {
      await this.reminderRepository.deleteManyByDaysAndExpirationId(daysToDelete, expirationId);
    }
  
    const updatePromises: Promise<Reminder>[] = [];
    const dtosToCreate: UpdateReminderDto[] = [];
  
    for (const dto of remindersDto) {
      const existingReminder = existingReminders.find((r) => r.days === dto.days);
  
      if (existingReminder) {
        // Si el reminder ya existe, se actualiza si es necesario
        updatePromises.push(this.reminderRepository.update(existingReminder.id, dto));
      } else {
        // Si no existe, se agrega a la lista de creación
        dtosToCreate.push(dto);
      }
    }
  
    // Crear los nuevos reminders
    const remindersToCreate: Reminder[] = dtosToCreate.map((dto) => {
      const reminder = new Reminder();
      reminder.days = dto.days;
      reminder.expirationId = expirationId;
      return reminder;
    });
  
    const createPromise =
      remindersToCreate.length > 0
        ? this.reminderRepository.saveMany(remindersToCreate)
        : Promise.resolve([]);
  
    await Promise.all([...updatePromises, createPromise]);
  }  

  async createReminders(
    reminders: CreateReminderDto[],
    expirationId: number,
  ): Promise<Reminder[]> {
    try {
      const reminderEntities = reminders.map((reminderData) => {
        const reminder = new Reminder();
        reminder.days = reminderData.days;
        reminder.expirationId = expirationId;
        return reminder;
      });

      return await this.reminderRepository.saveMany(reminderEntities);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteReminders(expirationId: number): Promise<void> {
    try {
      await this.reminderRepository.deleteByExpirationId(expirationId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
