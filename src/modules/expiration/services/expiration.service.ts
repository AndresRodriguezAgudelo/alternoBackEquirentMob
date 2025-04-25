import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { ExpirationRepository } from "../repository/expiration.repository";
import {
  CreateExpirationDto,
  UpdateExpirationDto,
} from "../schemas/expiration.schema";
import { Expiration } from "../entities/expiration.entity";
import { ReminderService } from "@/modules/reminder/services/reminder.service";
import { VehicleService } from "@/modules/vehicle/services/vehicle.service";
import { PageDto, PageOptionsDto } from "@/common";
import to from "await-to-js";
import { addMonths, differenceInDays, parseISO, startOfDay } from "date-fns";
import { InsurerService } from "@/modules/insurer/services/insurer.service";
import { RuntService } from "@/config/runt/runt.service";
import { FinesSimitService } from "@/modules/fines-simit/services/fines-simit.service";
import { PeakPlateService } from "@/modules/peak-plate/services/peak-plate.service";
import { UserService } from "@/modules/user/services/user.service";
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { IUser } from "@/interfaces/user.interface";
import { QueryHistoryService } from "@/modules/query-history/services/query-history.service";
import { subHours } from 'date-fns';
import { formatMinusHoursBogota } from "@/common/utils/Date";
@Injectable()
export class ExpirationService {
  constructor(
    private readonly expirationRepository: ExpirationRepository,
    private readonly reminderService: ReminderService,
    @Inject(forwardRef(() => VehicleService))
    private readonly vehicleService: VehicleService,
    private readonly insurerService: InsurerService,
    private readonly runtService: RuntService,
    private readonly finesSimitService: FinesSimitService,
    private readonly peakPlateService: PeakPlateService,
    private readonly userService: UserService,
    private readonly queryHistoryService: QueryHistoryService,
  ) { }

  async create(body: CreateExpirationDto): Promise<Expiration> {
    try {
      const existingExpiration = await this.expirationRepository.findOne({
        vehicleId: body.vehicleId,
        expirationType: body.expirationType,
      });
      if (existingExpiration) {
        throw new HttpException(
          "El vencimiento ya existe",
          HttpStatus.BAD_REQUEST,
        );
      }
      const vehicle = await this.vehicleService.findOne(body.vehicleId);
      if (!vehicle) {
        throw new HttpException("Vehículo no encontrado", HttpStatus.NOT_FOUND);
      }
      //validar que solo se puedan crear maximo 3 vencimientos mas despues de los 11 por defecto que tiene cada vehiculo
      const total = await this.expirationRepository.count(body.vehicleId);

      console.log('lucas',total);

      if (total >= 14) {
        throw new HttpException(
          "Solo se pueden crear 3 vencimientos adicionales por vehiculo",
          HttpStatus.BAD_REQUEST,
        );
      }

      const generalReminders:any = [
        {days: 3},
        {days: 5},
        {days: 7},
        {days: 30},
      ];

      const expiration = new Expiration();
      expiration.expirationType = body.expirationType;
      expiration.expirationDate = body.expirationDate;
      expiration.isSpecial = body.isSpecial ?? true;
      expiration.hasBanner = body.hasBanner ?? false;
      expiration.vehicleId = body.vehicleId;
      expiration.description = body.description ?? "";
      expiration.extraData = body.extraData || {};

      const reminders = generalReminders;
    
      body.reminders = reminders;

      console.log('data ',expiration); 
      console.log('body ',body); 


      const savedExpiration = await this.expirationRepository.save(expiration);
      if (body.reminders && body.reminders.length > 0) {
        await this.reminderService.createReminders(
          body.reminders,
          savedExpiration.id,
        );
      }
      return savedExpiration;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createWithRetry(
    expirationDto: CreateExpirationDto,
    maxRetries = 3
  ): Promise<Expiration> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await this.create(expirationDto);
      } catch (error) {
        attempt++;
        console.error(
          `Error al crear ${expirationDto.expirationType} en intento ${attempt}:`,
          error.message
        );
        // Puedes agregar un pequeño retraso entre intentos si lo deseas
      }
    }
  }

  async createMassExpirations(
    vehicleId: number,
    userId: number,
  ): Promise<Expiration[]> {

    const generalReminders:any = [
      {days: 3},
      {days: 5},
      {days: 7},
      {days: 30},
    ];

    const expirationsData: CreateExpirationDto[] = [
      {
        expirationType: "Póliza todo riesgo",
        description:
          "Contar con una Póliza de Seguro Todo Riesgo le brinda protección para usted, su vehículo y terceras partes.  Configure esta alerta y COTICE con nosotros.",
        isSpecial: false,
        hasBanner: true,
        vehicleId,
      },
      {
        expirationType: "Extintor",
        description:
          "Por ley y seguridad el extintor debe ser recargado cada año, evite sanciones y contratiempos configurando esta alerta.",
        isSpecial: false,
        hasBanner: false,
        vehicleId
      },
      {
        expirationType: "Kit de carretera",
        description:
          "El Kit de Carretera es una medida de precaución que puede marcar la diferencia en una situación de emergencia.  Revíselo periódicamente configurando esta alerta.",
        isSpecial: false,
        hasBanner: false,
        vehicleId
      },
      {
        expirationType: "Cambio de llantas",
        description:
          "Revisiones periódicas prolongan la vida útil de sus neumáticos, mejoran el desempeño del vehículo, y velan por su seguridad. Configure esta alerta y agende su cita de revisión.",
        isSpecial: false,
        hasBanner: true,
        vehicleId
      },
      {
        expirationType: "Cambio de aceite",
        description:
          "El cambio de aceite es clave para prolongar la vida útil de su motor, se recomienda cambiarlo cada 5.000 o 10.000 kilómetros. Revise el último mantenimiento y configure esta alerta.",
        isSpecial: false,
        hasBanner: true,
        vehicleId
      },
      {
        expirationType: "Revisión de frenos",
        description:
          "Revisar frenos periódicamente ayuda a mantener su vehiculo en óptimas condiciones asi como evitar accidentes.  Configure esta alerta y agende su cita de revisión.",
        isSpecial: false,
        hasBanner: true,
        vehicleId,
      },
      {
        expirationType: "RTM",
        description:
          "La RTM es un requisito obligatorio ya que mejora la seguridad vial y reduce el riesgo de siniestros en las carreteras.  Configure esta alerta y agende en su CDA de confianza.",
        isSpecial: true,
        hasBanner: true,
        vehicleId,
      },//!
      {
        expirationType: "SOAT",
        description:
          "El SOAT además de ser un requisito obligatorio, se encarga de salvaguardar la integridad física de los involucrados en un accidente de tránsito, configure esta alerta y RENUÉVELO con nosotros.",
        isSpecial: true,
        hasBanner: true,
        vehicleId,
      },//!
      {
        expirationType: "Licencia de conducción",
        description:
          "Renueve su licencia de conducción a tiempo y ⚠️ ¡Evite sanciones! ⚠️ Aplica T&C",
        isSpecial: true,
        hasBanner: false,
        vehicleId,
      },//!
      {
        expirationType: "Pico y placa",
        description:
          "Su placa SI puede circular hoy en la ciudad escogida, puede cambiarla según sus preferencias de movilidad. ⚠️ ¡Evite multas! ⚠️ Aplica T&C",
        isSpecial: true,
        hasBanner: false,
        vehicleId
      },//!
      {
        expirationType: "Multas",
        description:
          "El cumplimiento de las normas de tránsito es clave para garantizar la seguridad vial. El respeto de las señales, límites de velocidad y reglas de prioridad ayuda a evitar colisiones y reduce el riesgo de accidentes. Aplica T&C",
        isSpecial: true,
        hasBanner: false,
        vehicleId
      },//!
    ];

    const promises = expirationsData.map((expirationDto) =>
      this.createWithRetry.call(this, expirationDto)
    );
    
    const results = await Promise.allSettled(promises);
    const createdExpirations = results
      .filter((result) => result.status === "fulfilled")
      .map((result: any) => result.value);
    
    // Revisión de los fallos (en caso de que quieras hacer algo más con ellos)
    const failedExpirations = results.filter(
      (result) => result.status === "rejected"
    );
    
    if (failedExpirations.length > 0) {
      failedExpirations.forEach((failed) =>
        console.error("Fallo en creación:", failed)
      );
    }

    // Actualización de vencimientos especiales que usan RUNT (SOAT, RTM, Licencia de conducción)
    const specialTypesRequiringRunt = ["SOAT", "RTM", "Licencia de conducción"];
    const specialExpirations = createdExpirations.filter(
      (exp) =>
        exp.isSpecial && specialTypesRequiringRunt.includes(exp.expirationType),
    );

    if (specialExpirations.length > 0) {
      const vehicle: any = await this.vehicleService.findOne(vehicleId);
      if (vehicle && vehicle.licensePlate) {
        let runtData = null;
        try {
          runtData = await this.runtService.queryPlate(vehicle.licensePlate);
        } catch (error) {
          console.error(
            "Error consultando RUNT en creación masiva:",
            error.message,
          );
        }

        for (const exp of specialExpirations) {
          if (runtData) {
            if (exp.expirationType === "SOAT") {
              exp.expirationDate =
                runtData.dateLatestSOATExpiry || exp.expirationDate;
              exp.extraData = {
                ...exp.extraData,
                runtData,
                runtLastQuery: new Date().toISOString(),
                runtEstado: runtData.latestSOATStatus || "No disponible",
                policyNumber:
                  runtData.policyNumber || exp.extraData?.policyNumber,
              };
            } else if (exp.expirationType === "RTM") {
              exp.expirationDate = runtData.dateRTMExpiry || exp.expirationDate;
              exp.extraData = {
                ...exp.extraData,
                runtData,
                runtLastQuery: new Date().toISOString(),
                runtEstado: runtData.latestRTM || "No disponible",
                lastCDA: exp.extraData?.lastCDA || "No disponible",
              };
            } else if (exp.expirationType === "Licencia de conducción") {
              exp.extraData = {
                ...exp.extraData,
                runtData,
                runtLastQuery: new Date().toISOString(),
                vehicleServiceType:
                  runtData.vehicleServiceType || "No disponible",
              };
            }
          } else {
            console.log(
              "No se encontraron datos RUNT para",
              exp.expirationType,
            );
            if (exp.expirationType === "SOAT") {
              exp.expirationDate = null;
              exp.extraData = {
                ...exp.extraData,
                runtData: "No disponible",
                runtLastQuery: new Date().toISOString(),
                runtEstado: "No disponible",
                policyNumber: "No disponible",
              };
            } else if (exp.expirationType === "RTM") {
              exp.expirationDate = null;
              exp.extraData = {
                ...exp.extraData,
                runtData: "No disponible",
                runtLastQuery: new Date().toISOString(),
                runtEstado: "No disponible",
                lastCDA: "No disponible",
              };
            } else if (exp.expirationType === "Licencia de conducción") {
              exp.extraData = {
                ...exp.extraData,
                runtData: "No disponible",
                runtLastQuery: new Date().toISOString(),
                vehicleServiceType: "No disponible",
              };
            }
          }
          await this.expirationRepository.save(exp);
        }
      }
    }

    // Actualización para vencimientos de "Multas" usando scraping (SIMIT)
    const finesType = "multas";
    const finesExpirations = createdExpirations.filter(
      (exp) => exp.expirationType.toLowerCase() === finesType,
    );
    if (finesExpirations.length > 0) {
      console.log("Actualizando datos SIMIT para multas:", finesExpirations);
      finesExpirations.forEach((exp) => {
        console.log("Procesando actualización de SIMIT para:", exp);
        this.updateSimitData(exp, userId).catch((err) =>
          console.error(
            "Error actualizando datos SIMIT en creación masiva:",
            err,
          ),
        );
      });
    }

    const picoExpiration = createdExpirations.find(
      (exp) => exp.expirationType.toLowerCase() === "pico y placa",
    );

    if (picoExpiration) {
      
      const user = await this.userService.findOneRelations({ id: userId });
      const vehicle: any = await this.vehicleService.findOne(vehicleId);

      const peakPlateData = await this.peakPlateService.get(
        user.city.cityName.toLowerCase(),
        vehicle.licensePlate,
      );
      const today = new Date();
      const day = today.getDate();
      console.log('asdasd', peakPlateData)
      const currentRestriction = peakPlateData.dailyRestrictions.find(
        (r: any) => r.day === day,
      );
      const picoStatus = currentRestriction
        ? "Tiene pico y placa"
        : "Puede Permitido salir";
    }

    for (const exp of createdExpirations) {
      // Verificamos que la expiración tenga un id definido
      try {
        const createdReminders = await this.reminderService.createReminders(generalReminders, exp.id);
        exp.reminders = createdReminders;
      } catch (error) {
        console.error("Error al crear reminders para expiration id", exp.id, error);
      }
    }
    

    return createdExpirations;
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    vehicleId: number,
  ): Promise<PageDto<Expiration>> {
    try {

      const pageDto = await this.expirationRepository.findAll(
        pageOptionsDto,
        vehicleId,
      );

      const vehicle = await this.vehicleService.findOne(vehicleId);
      const updatedData = await Promise.all(
        pageDto.data.map(async (exp) => {
          if (exp.expirationType.toLowerCase() === "pico y placa") {
            exp.status = await this.getPicoPlateStatus(vehicle.licensePlate);
            if (exp.status === "No salir") {
              exp.color = "red";
            } else if (exp.status === "Puede salir") {
              exp.color = "green";
            }
          }
          return exp;
        }),
      );
      pageDto.data = updatedData;
      return pageDto;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getPicoPlateStatus(plate: string): Promise<string> {
    try {
      const peakPlateData = await this.peakPlateService.getLatestByPlate(plate);
      console.log('laura',peakPlateData);
      if (peakPlateData) {
        const today = new Date();
        const day = today.getDate();
        const currentRestriction = peakPlateData.dailyRestrictions.find(
          (r: any) => r.day === day,
        );
        if (
          currentRestriction !== undefined &&
          typeof currentRestriction.status === "boolean"
        ) {
          return currentRestriction.status ? "No salir" : "Puede salir";
        }
      }
      return "Sin información";
    } catch (error) {
      console.error("Error en getPicoPlateStatus:", error);
      return "Sin información";
    }
  }

  private async updateRuntData(expiration: Expiration): Promise<Expiration> {
    const specialTypesRequiringRunt = ["SOAT", "RTM", "Licencia de conducción"];
    if (!specialTypesRequiringRunt.includes(expiration.expirationType)) {
      return expiration;
    }
    const lastQuery = expiration.extraData?.runtLastQuery
      ? new Date(expiration.extraData.runtLastQuery)
      : null;
    const now = new Date();
    if (lastQuery && differenceInDays(now, lastQuery) < 15) {
      return expiration;
    }
    const vehicle: any = await this.vehicleService.findOne(
      expiration.vehicleId,
    );
    if (!vehicle || !vehicle.licensePlate) {
      return expiration;
    }
    const [error, runtData] = await to(
      this.runtService.queryPlate(vehicle.licensePlate),
    );
    if (error || !runtData) {
      console.error("Error consultando RUNT:", error?.message);
      return expiration;
    }
    if (expiration.expirationType === "SOAT") {
      expiration.expirationDate =
        runtData.dateLatestSOATExpiry || expiration.expirationDate;
      expiration.extraData = {
        ...expiration.extraData,
        runtData,
        runtLastQuery: now.toISOString(),
        runtEstado: runtData.latestSOATStatus || "No disponible",
        policyNumber:
          runtData.policyNumber || expiration.extraData?.policyNumber,
      };
    } else if (expiration.expirationType === "RTM") {
      expiration.expirationDate =
        runtData.dateRTMExpiry || expiration.expirationDate;
      expiration.extraData = {
        ...expiration.extraData,
        runtData,
        runtLastQuery: now.toISOString(),
        runtEstado: runtData.latestRTM || "No disponible",
        lastCDA: expiration.extraData?.lastCDA || "No disponible",
      };
    } else if (expiration.expirationType === "Licencia de conducción") {
      expiration.extraData = {
        ...expiration.extraData,
        runtData,
        runtLastQuery: now.toISOString(),
        vehicleServiceType: runtData.vehicleServiceType || "No disponible",
      };
    }
    return await this.expirationRepository.save(expiration);
  }

  private async updateSimitData(expiration: Expiration, userId?: number): Promise<Expiration> {
    if (expiration.expirationType.toLowerCase() !== "multas") {
      return expiration;
    }
    const vehicle: any = await this.vehicleService.findOne(
      expiration.vehicleId,
    );
    if (!vehicle || !vehicle.licensePlate) {
      return expiration;
    }
    try {
      const simitData = await this.finesSimitService.getFines(
        vehicle.licensePlate,
        { id: userId },
      );
      expiration.extraData = {
        ...expiration.extraData,
        simitData,
        simitLastQuery: new Date().toISOString(),
      };
      return await this.expirationRepository.save(expiration);
    } catch (error) {
      console.error("Error consultando SIMIT:", error.message);
      expiration.extraData = {
        ...expiration.extraData,
        simitData: {
          comparendos_multas: 0,
          totalPagar: 0,
          mensaje: "✅ No hay multas ni comparendos pendientes.",
          detallesComparendos: [
            {
              numeroMulta: "N/A",
              fecha: "N/A",
              codigoInfraccion: "N/A",
              descripcionInfraccion: "N/A",
              estado: "N/A",
              valorPagar: 0,
              detalleValor: {
                valorBase: "N/A",
                descuentoCapital: "N/A",
                intereses: "N/A",
                descuentoIntereses: "N/A",
                valorAdicional: "N/A",
              },
            },
          ],
        },
        simitLastQuery: new Date().toISOString(),
      };
      return await this.expirationRepository.save(expiration);
    }
  }

  async reloadExpiration(name: string, userId: number, expirationId: number): Promise<boolean> {
    try {

      await this.queryHistoryService.logQuery(userId, name.toLowerCase(), expirationId);

      
      const querysPerMonth = await this.queryHistoryService.countLogsForCurrentMonth(userId, name.toLowerCase()); 

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      if (querysPerMonth > 1) {
        throw new HttpException(`Ya utilizaste tu actualización este mes. Podrás realizar otra a partir del ${nextMonth.toLocaleDateString()}`, HttpStatus.BAD_REQUEST);
      }

      //update expiration
      const expiration = await this.expirationRepository.findOne({ id: expirationId });
      if (!expiration) {
        throw new HttpException("Expiración no encontrada", HttpStatus.NOT_FOUND);
      }
      expiration.updatedAt = new Date();
      expiration.lastUpdate = new Date();
      await this.expirationRepository.save(expiration);

      return true;

    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      let expiration = await this.expirationRepository.findOne({ id });
      if (!expiration) {
        throw new HttpException(
          "Expiración no encontrada",
          HttpStatus.NOT_FOUND,
        );
      }
      const specialTypesRequiringRunt = [
        "SOAT",
        "RTM",
        "Licencia de conducción",
      ];
      if (
        expiration.isSpecial &&
        specialTypesRequiringRunt.includes(expiration.expirationType)
      ) {
        expiration = await this.updateRuntData(expiration);
      }
      if (
        expiration.isSpecial &&
        expiration.expirationType.toLowerCase() === "multas"
      ) {
        this.updateSimitData(expiration).catch((err) =>
          console.error("Error actualizando datos SIMIT:", err),
        );
      }
      return this.prepareExpirationResponse(expiration);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  private calculateEstado(expiration: Expiration, fechaEvaluar: Date): string {
    if (expiration.expirationType.toLowerCase() === "licencia de conducción") {
      return "No disponible";
    }
    if (expiration.expirationType.toLowerCase() === "multas") {
      const simitData = expiration.extraData?.simitData;
      return simitData && simitData.comparendos_multas > 0
        ? "Tiene multas"
        : "Sin multas";
    }
    if (!fechaEvaluar) return "Configurar";

    const timeZone = "America/Bogota";
    const todayBogotaStr = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
    const expDateBogotaStr = formatInTimeZone(new Date(fechaEvaluar), timeZone, 'yyyy-MM-dd');
    const todayBogota = new Date(todayBogotaStr + 'T00:00:00Z');
    const expDateBogota = new Date(expDateBogotaStr + 'T24:00:00Z');

    const daysRemaining = differenceInDays(expDateBogota, todayBogota);

    if (daysRemaining > 7) return "Vigente";
    if (daysRemaining <= 7 && daysRemaining > 0) return "Por vencer";
    if (daysRemaining <= 0) return "Vencido";
    return "Configurar";
  }

  private async prepareExpirationResponse(
    expiration: Expiration,
  ): Promise<any> {
    const fechaEvaluar =
      expiration.extraData?.expirationDate || expiration.expirationDate;
    let estado = this.calculateEstado(expiration, fechaEvaluar);

    const iconMapping: { [key: string]: string } = {
      "Póliza todo riesgo": "assessment",
      Extintor: "fire_extinguisher",
      "Kit de carretera": "business_center",
      "Cambio de llantas": "Tire repair",
      "Cambio de aceite": "opacity",
      "Revisión de frenos": "construction",
    };
    const icon = iconMapping[expiration.expirationType] || "default_icon";

    function getColor(state: string): string {
      switch (state) {
        case "Configurar":
          return "gray";
        case "Vigente":
          return "green";
        case "Por vencer":
          return "yellow";
        case "Vencido":
          return "red";
        case "Tiene multas":
          return "red";
        case "Sin multas":
          return "green";
        case "No disponible":
          return "red";
        default:
          return "gray";
      }
    }
    const color = getColor(estado);

    const common = {
      id: expiration.id,
      expirationType: expiration.expirationType,
      expirationDate: expiration.expirationDate,
      reminders: expiration.reminders,
      isSpecial: expiration.isSpecial,
      hasBanner: expiration.hasBanner,
      description: expiration.description,
      estado,
      updatedAt: expiration.updatedAt,
      icon,
      color,
    };

    switch (expiration.expirationType) {
      case "Extintor":
      case "Kit de carretera":
        return common;

      case 'Revisión de frenos':
        return {
          id: expiration.id,
          expirationType: expiration.expirationType,
          lastMaintenanceDate:
            expiration.extraData?.lastMaintenanceDate || "No disponible",
          reminders: expiration.reminders,
          description: expiration.description,
          estado,
          expirationDate: expiration.expirationDate || "No disponible",
          isSpecial: expiration.isSpecial,
          hasBanner: expiration.hasBanner,
          updatedAt: expiration.updatedAt,
          icon,
          color,
          imagenBanner: 'https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20Frenos.jpg?sp=r&st=2025-04-01T23:04:57Z&se=2026-04-02T07:04:57Z&spr=https&sv=2024-11-04&sr=b&sig=0kvyNLxCSQiKoAnxjTo4AR6kdd%2BOughTBR81PiUh4zk%3D'
        };

      case "Cambio de llantas":
        return {
          id: expiration.id,
          expirationType: expiration.expirationType,
          description: expiration.description,
          lastMaintenanceDate:
            expiration.extraData?.lastMaintenanceDate || "No disponible",
          reminders: expiration.reminders,
          estado,
          expirationDate: expiration.expirationDate || "No disponible",
          isSpecial: expiration.isSpecial,
          hasBanner: expiration.hasBanner,
          updatedAt: expiration.updatedAt,
          icon,
          color,
          imageBanner: 'https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20Llantas.jpg?sp=r&st=2025-04-01T23:06:47Z&se=2026-04-02T07:06:47Z&spr=https&sv=2024-11-04&sr=b&sig=1ujszqupAmwHxpXTiTqFYm4NORsYLXzz3n%2FjADANo1k%3D'
        };

      case "Cambio de aceite":
        return {
          id: expiration.id,
          lastMaintenanceDate:
            expiration.extraData?.lastMaintenanceDate || "No disponible",
          reminders: expiration.reminders,
          estado,
          expirationDate: expiration.expirationDate || "No disponible",
          isSpecial: expiration.isSpecial,
          hasBanner: expiration.hasBanner,
          updatedAt: expiration.updatedAt,
          imageBanner:
            "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20Aceite.jpg?sp=r&st=2025-03-17T21:23:40Z&se=2026-03-18T05:23:40Z&spr=https&sv=2022-11-02&sr=b&sig=Y9E%2BVFIxiAQ4VSNb86IzyW7ISdvviBRhzs3ByjLZIpg%3D",
          description: expiration.description,
          icon,
          color,
        };

      case "Póliza todo riesgo": {
        const insurer = await this.insurerService.findOne(
          expiration.extraData?.insurerId,
        );
        return {
          id: expiration.id,
          expirationDate: expiration.expirationDate,
          reminders: expiration.reminders,
          estado,
          insurerId: insurer?.id || "No disponible",
          nameInsurer: insurer?.nameInsurer || "No disponible",
          isSpecial: expiration.isSpecial,
          hasBanner: expiration.hasBanner,
          updatedAt: expiration.updatedAt,
          imageBanner:
            "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20Poliza%20Todo%20Riesgo.jpg?sp=r&st=2025-03-17T21:20:20Z&se=2026-03-18T05:20:20Z&spr=https&sv=2022-11-02&sr=b&sig=PVPVeBoqXTpRzytYc6OVyUNJ3ceYS1B%2FTAa%2F3bq%2BNyo%3D",
          linkBanner: "https://apps.clientify.net/forms/simpleembed/#/forms/embedform/228575/39252",
          description: expiration.description,
          icon,
          color,
        };
      }

      case "SOAT":
        return {
          id: expiration.id,
          policyNumber: expiration.extraData?.policyNumber || "No disponible",
          insurer: expiration.extraData?.insurer || "No disponible",
          expirationDate:
            expiration.extraData?.runtData?.dateLatestSOATExpiry ||
            expiration.expirationDate,
          reminders: expiration.reminders,
          estado,
          imageBanner:
            "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20SOAT.jpg?sp=r&st=2025-04-04T19:36:34Z&se=2026-04-05T03:36:34Z&spr=https&sv=2024-11-04&sr=b&sig=297Dom9vB713usRVQJqgkcd3eoxzqOJl%2BGpFX2KhNGg%3D",
          isSpecial: expiration.isSpecial,
          hasBanner: expiration.hasBanner,
          updatedAt: expiration.updatedAt,
          description: expiration.description,
          icon,
          color,
          linkBanner: "https://apps.clientify.net/forms/simpleembed/#/forms/embedform/228575/39252",
        };

      case "RTM":
        return {
          id: expiration.id,
          lastCDA: expiration.extraData?.lastCDA || "No disponible",
          expirationDate:
            expiration.extraData?.runtData?.dateRTMExpiry ||
            expiration.expirationDate,
          reminders: expiration.reminders,
          estado,
          isSpecial: expiration.isSpecial,
          hasBanner: expiration.hasBanner,
          updatedAt:
            expiration.extraData?.runtData?.dateRTMIssue ||
            expiration.updatedAt,
          description: expiration.description,
          imageBanner:
            "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20%20RTM.jpg?sp=r&st=2025-03-18T02:14:41Z&se=2026-03-18T10:14:41Z&spr=https&sv=2022-11-02&sr=b&sig=iFMD6c%2Flxtzm%2BZ5DCo6SDPz1I2GIQapEW%2FoEaRuK4h4%3D",
          icon,
          color,
        };

      case "Licencia de conducción":
        return {
          id: expiration.id,
          category: expiration.extraData?.category || "No disponible",
          service:
            expiration.extraData?.runtData?.vehicleServiceType ||
            "No disponible",
          expirationDate:
            expiration.extraData?.expirationDate || expiration.expirationDate,
          reminders: expiration.reminders,
          estado: "No disponible",
          isSpecial: expiration.isSpecial,
          hasBanner: expiration.hasBanner,
          updatedAt: expiration.updatedAt,
          description: expiration.description,
          icon,
          color: "red",
        };

      case "Pico y placa":
        return common;

      case "Multas":
        return {
          ...common,
          simit: expiration.extraData?.simitData,
          estado:
            expiration.extraData?.simitData &&
              expiration.extraData?.simitData.comparendos_multas > 0
              ? "Tiene multas"
              : "Sin multas",
          icon,
          color: getColor(
            expiration.extraData?.simitData &&
              expiration.extraData?.simitData.comparendos_multas > 0
              ? "Tiene multas"
              : "Sin multas",
          ),
        };

      default:
        return common;
    }
  } //FIXME: REFACTOR THIS AND REMOVE URLS FROM HERE !!!

  async update(id: number, body: UpdateExpirationDto): Promise<Expiration> {
    try {

      console.log('body petición', body);

      const expiration = await this.expirationRepository.findOne({ id });
      if (!expiration) {
        throw new HttpException(
          "Expiración no encontrada",
          HttpStatus.NOT_FOUND,
        );
      }
      console.log('vida mia',expiration);
      expiration.expirationDate = body.expirationDate ?? expiration.expirationDate;
      expiration.expirationType = body.expirationType ?? expiration.expirationType;
      if(expiration.expirationType === 'Cambio de aceite'  || expiration.expirationType === 'Revisión de frenos' ){
        console.log('me da',body.extraData?.lastMaintenanceDate);
        //sumarle 6 meses a expiration.extraData?.lastMaintenanceDate
        expiration.expirationDate = addMonths(body.extraData?.lastMaintenanceDate, 6);
      }
      if(expiration.expirationType === 'Cambio de llantas' ){
        //sumarle 6 meses a expiration.extraData?.lastMaintenanceDate
        expiration.expirationDate = addMonths(body.extraData?.lastMaintenanceDate, 12);
      }

      expiration.isSpecial = body.isSpecial ?? expiration.isSpecial;
      expiration.hasBanner = body.hasBanner ?? expiration.hasBanner;
      expiration.description = body.description ?? expiration.description;
      expiration.extraData = {
        ...expiration.extraData,
        ...(body.extraData || {}),
      };

      const updatedExpiration = await this.expirationRepository.save(expiration);

      if (body.reminders) {
        await this.reminderService.updateReminders(body.reminders, updatedExpiration.id);
      } else if (Array.isArray(body.reminders) && body.reminders.length === 0) {
        // Si se envía un array vacío, eliminar todos los reminders asociados a esta expiration
        await this.reminderService.deleteReminders(updatedExpiration.id);
      }
      updatedExpiration.reminders = []
      return updatedExpiration;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }


  async delete(id: number): Promise<Expiration> {
    try {
      const expiration = await this.expirationRepository.findOne({ id });
      if (!expiration) {
        throw new HttpException(
          "Expiración no encontrada",
          HttpStatus.NOT_FOUND,
        );
      }
      await this.expirationRepository.delete(id);
      await this.reminderService.deleteReminders(id);
      return expiration;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
