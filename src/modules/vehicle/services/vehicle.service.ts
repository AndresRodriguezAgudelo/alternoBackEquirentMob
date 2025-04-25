import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { VehicleRepository } from "../repositories/vehicle.repository";
import { CreateVehicleDto, UpdateVehicleDto } from "../schemas/vehicle.schema";
import { Vehicle } from "../entities/vehicle.entity";
import to from "await-to-js";
import { PageDto, PageOptionsDto } from "@/common";
import { DocumentTypeService } from "@/modules/document-type/services/document-type.service";
import { IUser } from "@/interfaces/user.interface";
import { UserVehicleRepository } from "../repositories/userVehicle.repository";
import { UserVehicle } from "@/modules/user-vehicle/entities/userVehicle.entity";
import { RuntService } from "@/config/runt/runt.service";
import { ExpirationService } from "@/modules/expiration/services/expiration.service";

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly documentTypeService: DocumentTypeService,
    private readonly userVehicleRepository: UserVehicleRepository,
    private readonly runtService: RuntService,
    @Inject(forwardRef(() => ExpirationService))
    private readonly expirationService: ExpirationService,
  ) {}

  async create(body: CreateVehicleDto, user: IUser): Promise<Vehicle> {
    try {
      const existingVehicle = await this.vehicleRepository.findOne({
        licensePlate: body.licensePlate,
      });

      if (existingVehicle) {
        throw new HttpException(
          "El vehículo ya existe",
          HttpStatus.BAD_REQUEST,
        );
      }

      const documentType = await this.documentTypeService.findOne(
        body.typeDocumentId,
      );
      if (!documentType) {
        throw new HttpException(
          "Tipo de documento no encontrado",
          HttpStatus.BAD_REQUEST,
        );
      }

      const userVehicleCount = await this.userVehicleRepository.count(user.id);

      if (userVehicleCount >= 2) {
        throw new HttpException(
          "Solo se permite agregar un máximo de dos vehículos",
          HttpStatus.BAD_REQUEST,
        );
      }

      const vehicle = new Vehicle();
      vehicle.licensePlate = body.licensePlate;
      vehicle.numberDocument = body.numberDocument;
      vehicle.typeDocumentId = body.typeDocumentId;

      const [error, newVehicle] = await to(
        this.vehicleRepository.save(vehicle),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);

      const userVehicle = new UserVehicle();
      userVehicle.userId = user.id;

      userVehicle.vehicleId = newVehicle.id;

      const [errorNewuserVehicle] = await to(
        this.userVehicleRepository.save(userVehicle),
      );
      if (errorNewuserVehicle)
        throw new HttpException(errorNewuserVehicle, HttpStatus.BAD_REQUEST);

      //create expirations
      await this.expirationService.createMassExpirations(
        newVehicle.id,
        user.id,
      );
      /*await Promise.race([
                this.expirationService.createMassExpirations(newVehicle.id, user.id),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout en creación de vencimientos')), 60000))
              ]).catch(err => {
                this.logger.error('Timeout en la creación de vencimientos:', err);
              });*/

      return newVehicle;
    } catch (error) {
      throw new HttpException(
        error.message || "Error al crear el vehículo",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    user: IUser,
  ): Promise<PageDto<Vehicle>> {
    const { id } = user;
    try {
      const [error, data] = await to(
        this.vehicleRepository.findAll(pageOptionsDto, id),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const vehicle = await this.vehicleRepository.findOne({ id });
      if (!vehicle) {
        throw new HttpException("Vehículo no encontrado", HttpStatus.NOT_FOUND);
      }

      if (!vehicle.runtConsulted) {
        const [error, runtData] = await to(
          this.runtService.queryPlate(vehicle.licensePlate),
        );
        if (!error && runtData) {
          vehicle.model = runtData.vehicleModel || "No disponible";
          vehicle.age = runtData.age ? parseInt(runtData.age) : null;
          vehicle.brand = runtData.vehicleBrand || "No disponible";
          vehicle.line = runtData.vehicleLine || "No disponible";
          vehicle.class = runtData.vehicleClass || "No disponible";
          vehicle.service = runtData.vehicleServiceType || "No disponible";
          vehicle.fuel = runtData.fuelType || "No disponible";
          vehicle.color = runtData.vehicleColor || "No disponible";
          vehicle.passagers = runtData.numberPassengers
            ? parseInt(runtData.numberPassengers)
            : null;
          vehicle.vin = runtData.vehicleVIN || "No disponible";
          vehicle.serial = runtData.serialNumber || "No disponible";
          vehicle.numberEngine = runtData.engineNumber || "No disponible";
          vehicle.capacityEngine =
            runtData.vehicleEngineCapacity || "No disponible";
          vehicle.numberRegister =
            runtData.vehicleRegistrationNumber || "No disponible";
          vehicle.dateRegister = runtData.vehicleRegistrationDate
            ? new Date(runtData.vehicleRegistrationDate)
            : null;
          vehicle.cityRegisterName =
            runtData.vehicleRegistrationCity || "No disponible";
          vehicle.organismTransit =
            runtData.trafficAuthority || "No disponible";

          vehicle.runtConsulted = true;
          await this.vehicleRepository.save(vehicle);
        } else {
          vehicle.model = vehicle.model || "No disponible";
          vehicle.age = vehicle.age || null;
          vehicle.brand = vehicle.brand || "No disponible";
          vehicle.line = vehicle.line || "No disponible";
          vehicle.class = vehicle.class || "No disponible";
          vehicle.service = vehicle.service || "No disponible";
          vehicle.fuel = vehicle.fuel || "No disponible";
          vehicle.color = vehicle.color || "No disponible";
          vehicle.passagers = vehicle.passagers || null;
          vehicle.vin = vehicle.vin || "No disponible";
          vehicle.serial = vehicle.serial || "No disponible";
          vehicle.numberEngine = vehicle.numberEngine || "No disponible";
          vehicle.capacityEngine = vehicle.capacityEngine || "No disponible";
          vehicle.numberRegister = vehicle.numberRegister || "No disponible";
          vehicle.dateRegister = vehicle.dateRegister || null;
          vehicle.cityRegisterName =
            vehicle.cityRegisterName || "No disponible";
          vehicle.organismTransit = vehicle.organismTransit || "No disponible";
        }
      }

      const formattedVehicle = Object.keys(vehicle).reduce((acc, key) => {
        acc[key] = vehicle[key] !== null ? vehicle[key] : "No disponible";
        return acc;
      }, {});
      delete formattedVehicle["cityRegisterId"];
      delete formattedVehicle["runtConsulted"];
      return formattedVehicle;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<string> {
    try {
      const [error, data] = await to(this.vehicleRepository.update(id, dto));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number, user: IUser): Promise<void> {
    try {
      const [error, data] = await to(this.vehicleRepository.remove(id, user));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getVehicleHistory(plate: string) {
    try {
      const [error, runtData] = await to(this.runtService.queryPlate(plate));

      if (error || !runtData) {
        return {
          ultimateUpdate: new Date(),
          history: [
            {
              recordId: "No disponible",
              date: "No disponible",
              requestType: "RTM",
              status: "No disponible",
              entity: "No disponible",
            },
          ],
        };
      }
      console.log("runtData", runtData);
      const rtmRecord = {
        recordId: "No disponible",
        date: runtData.dateRTMIssue
          ? new Date(runtData.dateRTMIssue)
          : "No disponible",
        requestType: "RTM",
        status: runtData.latestRTM || "No disponible",
        entity: "No disponible",
      };

      let transferRecord = null;
      const transfers = Number(runtData.numberTransfers);
      if (transfers && transfers > 0) {
        transferRecord = {
          recordId: "No disponible",
          date:
            runtData.expeditionDate &&
            runtData.expeditionDate !== "NO REPORTADO"
              ? new Date(runtData.expeditionDate)
              : "No disponible",
          requestType: "Traspaso",
          status: "No disponible",
          entity: "No disponible",
        };
      }

      const historyArray = transferRecord
        ? [rtmRecord, transferRecord]
        : [rtmRecord];

      return {
        ultimateUpdate: new Date(),
        history: historyArray,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getVehicleAccidents(plate: string) {
    try {
      const [error, runtData] = await to(this.runtService.queryPlate(plate));
      console.log("amores", runtData);
      if (error || !runtData) {
        return {
          ultimateUpdate: new Date(),
          accidents: {
            totalAccidents: "No disponible",
            cityLastAccident: "No disponible",
            accidentIndicator: "No disponible",
            daysSinceLastAccident: "No disponible",
          },
        };
      }
      return {
        ultimateUpdate: new Date(),
        accidents: {
          totalAccidents: Number(runtData.historicalAccidentCount) || 0,
          cityLastAccident: runtData.cityLastAccident || "No disponible",
          accidentIndicator: Number(runtData.accidentIndicator) || 0,
          daysSinceLastAccident: Number(runtData.daysSinceLastAccident) || 0,
        },
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getVehiclePrecautionaryMeasures(plate: string) {
    try {
      const [error, runtData] = await to(this.runtService.queryPlate(plate));
      const toBoolean = (val: string): boolean =>
        val && val !== "NO REPORTADO" && val !== "0";
      if (error || !runtData) {
        return {
          ultimateUpdate: new Date(),
          precautionaryMeasures: {
            embargo: "No disponible",
            impound: "No disponible",
            kidnapping: "No disponible",
            reportedTheft: "No disponible",
            fatalAccident: "No disponible",
            openTransfer: "No disponible",
          },
        };
      }
      return {
        ultimateUpdate: new Date(),
        precautionaryMeasures: {
          embargo: toBoolean(runtData.armorPlatingIndicator),
          impound: toBoolean(runtData.liabilityPolicyIndicator),
          kidnapping: toBoolean(runtData.numberKidnapping),
          reportedTheft: toBoolean(runtData.numberVehicleTheftReport),
          fatalAccident: toBoolean(runtData.numberAccidentWithDeath),
          openTransfer: toBoolean(runtData.numberTransfers),
        },
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getVehicleTransferHistory(plate: string) {
    try {
      const [error, runtData] = await to(this.runtService.queryPlate(plate));
      const toBoolean = (val: string): boolean =>
        val && val !== "NO REPORTADO" && val !== "0";
      if (error || !runtData) {
        return {
          ultimateUpdate: new Date(),
          transferHistory: {
            pledge: false,
            precautionaryMeasures: false,
            taxes: false,
            soatActive: false,
            rtmStatus: false,
          },
        };
      }
      return {
        ultimateUpdate: new Date(),
        transferHistory: {
          pledge: toBoolean(runtData.pledgeEntity),
          precautionaryMeasures: toBoolean(
            runtData.precautionaryMeasuresindicator,
          ),
          taxes: toBoolean(runtData.certificateStatus),
          soatActive:
            runtData.latestSOATStatus === "EMITIDA" &&
            new Date() < new Date(runtData.dateLatestSOATExpiry),
          rtmStatus: runtData.latestRTM === "APROBADA",
        },
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
