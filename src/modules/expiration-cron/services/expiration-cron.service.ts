import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { subDays, isSameDay, startOfDay, endOfDay, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Not, IsNull } from "typeorm";
import { Expiration } from "@/modules/expiration/entities/expiration.entity";
import { TwilioService } from "@/modules/twilio/service/twilio.service";
import { VehicleService } from "@/modules/vehicle/services/vehicle.service";
import { ExpirationCronRepository } from "../repositories/expiration-cron.repository";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserVehicle } from "@/modules/user-vehicle/entities/userVehicle.entity";
import { User } from "@/modules/user/entities/user.entity";
import { NotificationService } from "@/modules/notifications/services/notifications.service";
import { Cron } from "@nestjs/schedule";
import { isBefore } from "date-fns";
@Injectable()
export class ExpirationCronService {
  private readonly logger = new Logger(ExpirationCronService.name);
  private readonly timeZone = "America/Bogota";

  constructor(
    @InjectRepository(Expiration)
    private readonly expirationRepository: Repository<Expiration>,
    private readonly twilioService: TwilioService,
    private readonly vehicleService: VehicleService,
    @InjectRepository(UserVehicle)
    private readonly userVehicleRepository: Repository<UserVehicle>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly expirationCronRepo: ExpirationCronRepository,
    private readonly notificationService: NotificationService,
  ) {}

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  @Cron("*/10 * * * *")
  async handleExpirations() {
    this.logger.log("Iniciando verificación de expiraciones...");
    const today = new Date();
    const todayBogota = toZonedTime(today, this.timeZone);

    // Procesamiento por lotes: 100 registros cada 10 segundos
    const pageSize = 35;
    let page = 0;
    let expirationsBatch: Expiration[] = [];

    do {
      try {
        expirationsBatch = await this.expirationRepository.find({
          where: { expirationDate: Not(IsNull()) },
          relations: ["reminders"],
          skip: page * pageSize,
          take: pageSize,
        });
      } catch (error) {
        this.logger.error("Error obteniendo expiraciones en batch", error);
        throw new HttpException(
          "Error al obtener expiraciones",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(
        `Procesando lote ${page + 1} con ${expirationsBatch.length} registros`,
      );

      for (const expiration of expirationsBatch) {
        const expDate = parse(
          expiration.expirationDate.toString(),
          "yyyy-MM-dd",
          new Date(),
        );
        this.logger.debug(
          `Expiración ${expiration.id} - Fecha parseada: ${expDate}`,
        );

        if (expiration.reminders && expiration.reminders.length > 0) {
          for (const reminder of expiration.reminders) {
            this.logger.debug(
              `Reminder días: ${reminder.days} para expiración ${expiration.id}`,
            );
            const notifyDate = subDays(expDate, reminder.days);
            const notifyDateBogota = toZonedTime(notifyDate, this.timeZone);
            this.logger.debug(
              `notifyDate (Bogota): ${notifyDateBogota.toISOString()}`,
            );

            // Si hoy (en Bogotá) coincide con la fecha de notificación
            if (isSameDay(todayBogota, notifyDateBogota)) {
              this.logger.debug(
                `Entrando en if para enviar notificación para expiración ${expiration.id}`,
              );

              // Rango del día actual para evitar duplicados
              const startDay = startOfDay(todayBogota);
              const endDay = endOfDay(todayBogota);

              // Verificar si ya existe una notificación para este reminder
              let notificationExists;
              try {
                notificationExists =
                  await this.expirationCronRepo.findNotification(
                    expiration.id,
                    reminder.days,
                    startDay,
                    endDay,
                    "whatsapp",
                  );
              } catch (error) {
                this.logger.error(
                  `Error buscando notificación para expiración ${expiration.id}`,
                  error,
                );
                throw new HttpException(
                  "Error al verificar notificaciones",
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              }

              if (!notificationExists) {
                let vehicle;
                try {
                  vehicle = await this.vehicleService.findOne(
                    expiration.vehicleId,
                  );
                } catch (error) {
                  this.logger.error(
                    `Error obteniendo vehículo con id ${expiration.vehicleId}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al obtener vehículo",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }

                // Obtener el número de teléfono:
                // 1. Buscar en UserVehicle usando vehicleId
                let userVehicle;
                try {
                  userVehicle = await this.userVehicleRepository.findOne({
                    where: { vehicleId: expiration.vehicleId },
                  });
                } catch (error) {
                  this.logger.error(
                    `Error obteniendo userVehicle para vehicleId ${expiration.vehicleId}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al obtener usuario vehículo",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }
                if (!userVehicle) {
                  this.logger.warn(
                    `No se encontró UserVehicle para vehicleId ${expiration.vehicleId}`,
                  );
                  continue;
                }

                // 2. Con el userId de UserVehicle, buscar en User para obtener el teléfono
                let user;
                try {
                  user = await this.userRepository.findOne({
                    where: { id: userVehicle.userId },
                  });
                } catch (error) {
                  this.logger.error(
                    `Error obteniendo usuario con id ${userVehicle.userId}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al obtener usuario",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }
                if (!user || !user.phone) {
                  this.logger.warn(
                    `Usuario o número de teléfono no encontrado para vehicleId ${expiration.vehicleId}`,
                  );
                  continue;
                }

                let pronoum = "La";
                if (
                  expiration.expirationType === "SOAT" ||
                  expiration.expirationType === "Extintor" ||
                  expiration.expirationType === "Kit de carretera" ||
                  expiration.expirationType === "Cambio de aceite" ||
                  expiration.expirationType === "Pico y placa" ||
                  expiration.expirationType === "Cambio de llantas"
                ) {
                  pronoum = "El";
                }

                const phoneNumber = `+57${user.phone}`;

                const message = `⚠️ ¡Ojo! ${expiration.expirationType} por vencer
El ${expiration.expirationType} de tu vehículo ${vehicle.licensePlate} vence en ${reminder.days} días.`;

                const templateSid = "HX59cb0678762ed9f2fe1c1c9ee006c89b";
                const variables = {
                  "1": expiration.expirationType,
                  "2": pronoum,
                  "3": expiration.expirationType,
                  "4": vehicle.licensePlate,
                  "5": reminder.days.toString(),
                };

                try {
                  await this.twilioService.sendTemplateWhatsapp(
                    phoneNumber,
                    templateSid,
                    variables,
                  );
                  await this.expirationCronRepo.createNotification({
                    message,
                    expirationId: expiration.id,
                    reminderDays: reminder.days,
                    notifiedAt: today,
                    type: "whatsapp",
                  });
                  this.logger.log(
                    `Notificación enviada para expiración ${expiration.id} con reminderDays ${reminder.days}`,
                  );
                } catch (error) {
                  this.logger.error(
                    `Error al enviar notificación para expiración ${expiration.id}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al enviar notificación",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }
              } else {
                this.logger.debug(
                  `Ya existe notificación para expiración ${expiration.id} con reminderDays ${reminder.days} en el día`,
                );
              }
            }
          }
        }
      }

      page++;
      // Si se obtuvo un lote completo, esperar 10 segundos antes de procesar el siguiente lote
      if (expirationsBatch.length === pageSize) {
        this.logger.log(`Esperando 10 segundos para el siguiente lote...`);
        await this.delay(10000);
      }
    } while (expirationsBatch.length === pageSize);

    this.logger.log("Verificación de expiraciones completada.");
  }

  @Cron("*/10 * * * *")
  async handleExpirationsPush() {
    this.logger.log(
      "Iniciando verificación de expiraciones para push notifications...",
    );
    const today = new Date();
    const todayBogota = toZonedTime(today, this.timeZone);

    // Procesamiento por lotes: 5 registros cada 10 segundos
    const pageSize = 35;
    let page = 0;
    let expirationsBatch: Expiration[] = [];

    do {
      try {
        expirationsBatch = await this.expirationRepository.find({
          where: { expirationDate: Not(IsNull()) },
          relations: ["reminders"],
          skip: page * pageSize,
          take: pageSize,
        });
      } catch (error) {
        this.logger.error("Error obteniendo expiraciones en batch", error);
        throw new HttpException(
          "Error al obtener expiraciones",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.log(
        `Procesando lote ${page + 1} con ${expirationsBatch.length} registros`,
      );

      for (const expiration of expirationsBatch) {
        const expDate = parse(
          expiration.expirationDate.toString(),
          "yyyy-MM-dd",
          new Date(),
        );
        this.logger.debug(
          `Expiración ${expiration.id} - Fecha parseada: ${expDate}`,
        );

        if (expiration.reminders && expiration.reminders.length > 0) {
          for (const reminder of expiration.reminders) {
            this.logger.debug(
              `Reminder días: ${reminder.days} para expiración ${expiration.id}`,
            );
            const notifyDate = subDays(expDate, reminder.days);
            const notifyDateBogota = toZonedTime(notifyDate, this.timeZone);
            this.logger.debug(
              `notifyDate (Bogota): ${notifyDateBogota.toISOString()}`,
            );

            // Si hoy (en Bogotá) coincide con la fecha de notificación
            if (isSameDay(todayBogota, notifyDateBogota)) {
              this.logger.debug(
                `Entrando en if para enviar push notification para expiración ${expiration.id}`,
              );

              // Rango del día actual para evitar duplicados
              const startDay = startOfDay(todayBogota);
              const endDay = endOfDay(todayBogota);

              // Verificar si ya existe una notificación para este reminder
              let notificationExists;
              try {
                notificationExists =
                  await this.expirationCronRepo.findNotification(
                    expiration.id,
                    reminder.days,
                    startDay,
                    endDay,
                    "push",
                  );
              } catch (error) {
                this.logger.error(
                  `Error buscando notificación para expiración ${expiration.id}`,
                  error,
                );
                throw new HttpException(
                  "Error al verificar notificaciones",
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              }

              if (!notificationExists) {
                let vehicle;
                try {
                  vehicle = await this.vehicleService.findOne(
                    expiration.vehicleId,
                  );
                } catch (error) {
                  this.logger.error(
                    `Error obteniendo vehículo con id ${expiration.vehicleId}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al obtener vehículo",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }

                // Obtener el UserVehicle para identificar el usuario
                let userVehicle;
                try {
                  userVehicle = await this.userVehicleRepository.findOne({
                    where: { vehicleId: expiration.vehicleId },
                  });
                } catch (error) {
                  this.logger.error(
                    `Error obteniendo userVehicle para vehicleId ${expiration.vehicleId}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al obtener usuario vehículo",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }
                if (!userVehicle) {
                  this.logger.warn(
                    `No se encontró UserVehicle para vehicleId ${expiration.vehicleId}`,
                  );
                  continue;
                }

                // Obtener el dispositivo en base al userId
                let device;
                try {
                  device =
                    await this.notificationService.getDeviceRegistrations(
                      userVehicle.userId,
                    );
                  device = device[0];
                } catch (error) {
                  this.logger.error(
                    `Error obteniendo usuario con id ${userVehicle.userId}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al obtener usuario",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }
                if (!device || !device.deviceToken || !device.platform) {
                  this.logger.warn(
                    `Usuario o datos de dispositivo no encontrados para vehicleId ${expiration.vehicleId}`,
                  );
                  continue;
                }

                let pronoum = "La";
                if (
                  expiration.expirationType === "SOAT" ||
                  expiration.expirationType === "Extintor" ||
                  expiration.expirationType === "Kit de carretera" ||
                  expiration.expirationType === "Cambio de aceite" ||
                  expiration.expirationType === "Pico y placa" ||
                  expiration.expirationType === "Cambio de llantas"
                ) {
                  pronoum = "El";
                }

                // Construir el mensaje para push notification
                const messageTitle = `¡Ojo! ${expiration.expirationType} por vencer`;
                const messageBody = `${pronoum} ${expiration.expirationType} de tu vehículo ${vehicle.licensePlate} vence en ${reminder.days} días.`;

                this.logger.warn(
                  `Enviando notificación push para expiración ${expiration.id} con reminderDays ${reminder.days}`,
                );
                let color: string;

                if (reminder.days <= 7) {
                  color = "red";
                } else if (reminder.days <= 15 && reminder.days > 7) {
                  color = "yellow";
                } else {
                  color = "green";
                }

                const icon = isBefore(expDate, todayBogota) ? "alert" : "clock";

                const payloadObject = {
                  message: {
                    notification: {
                      title: messageTitle.toString(),
                      body: messageBody.toString(),
                    },
                    data: {
                      color: color.toString(),
                      icon,
                      date: notifyDate.toString(),
                      onTap: expiration.expirationType.toString(),
                    },
                  },
                };

                const payload = JSON.stringify(payloadObject);

                this.logger.log("Me quieres?", device.deviceToken);

                try {
                  // Enviar la notificación de acuerdo a la plataforma del dispositivo
                  if (device.platform.toLowerCase() === "android") {
                    console.log("Enviando notificación a android");
                    await this.notificationService.sendFcmNotification(
                      payload,
                      device.deviceToken,
                    );
                  } else if (device.platform.toLowerCase() === "ios") {
                    await this.notificationService.sendApnsNotification(
                      payload,
                    );
                  } else {
                    this.logger.warn(
                      `Plataforma no soportada para usuario ${device.id}`,
                    );
                    continue;
                  }
                  // Registrar la notificación para evitar duplicados
                  await this.expirationCronRepo.createNotification({
                    message: `${messageTitle}\n${messageBody}`,
                    expirationId: expiration.id,
                    reminderDays: reminder.days,
                    notifiedAt: today,
                    type: "push",
                  });
                  this.logger.log(
                    `Push notification enviada para expiración ${expiration.id} con reminderDays ${reminder.days}`,
                  );
                } catch (error) {
                  this.logger.error(
                    `Error al enviar push notification para expiración ${expiration.id}`,
                    error,
                  );
                  throw new HttpException(
                    "Error al enviar push notification",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }
              } else {
                this.logger.debug(
                  `Ya existe notificación push para expiración ${expiration.id} con reminderDays ${reminder.days} en el día`,
                );
              }
            }
          }
        }
      }

      page++;
      // Si se obtuvo un lote completo, esperar 10 segundos antes de procesar el siguiente lote
      if (expirationsBatch.length === pageSize) {
        this.logger.log("Esperando 10 segundos para el siguiente lote...");
        await this.delay(10000);
      }
    } while (expirationsBatch.length === pageSize);

    this.logger.log(
      "Verificación de expiraciones para push notifications completada.",
    );
  }
}
