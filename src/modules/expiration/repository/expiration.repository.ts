import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { Expiration } from "../entities/expiration.entity";
import { UpdateExpirationDto } from "../schemas/expiration.schema";
import { differenceInDays, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

@Injectable()
export class ExpirationRepository {
  constructor(
    @InjectRepository(Expiration)
    private readonly repository: Repository<Expiration>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(expiration: Expiration): Promise<Expiration> {
    const savedExpiration = await this.repository.save(expiration);
    return this.findOne({ id: savedExpiration.id });
  }

  public async findOne(data: Partial<Expiration>): Promise<Expiration> {
    try {
      return await this.repository.findOne({
        where: { ...data },
        relations: ["reminders"],
      });
    } catch (error) {
      throwCustomError("expiration_not_found");
    }
  }


  public async findAll(
    pageOptionsDto: PageOptionsDto,
    vehicleId: number,
  ): Promise<any> {
    const expirationOrder = {
      "rtm": 1,
      "soat": 2,
      "licencia de conducción": 3,
      "pico y placa": 4,
      "multas": 5,
      "póliza todo riesgo": 6,
      "extintor": 7,
      "kit de carretera": 8,
      "cambio de llantas": 9,
      "cambio de aceite": 10,
      "revisión de frenos": 11
    };

    const iconMapping: { [key: string]: string } = {
      "póliza todo riesgo": "assessment",
      "extintor": "fire_extinguisher",
      "kit de carretera": "business_center",
      "cambio de llantas": "Tire repair",
      "cambio de aceite": "opacity",
      "revisión de frenos": "construction",
      "rtm": "MiscellaneousServices",
      "pico y placa": "directions_car",
      "licencia de conducción": "account_box",
      "soat": "Security",
      "multas": "assignment",
    };
  
    const queryBuilder = this.repository.createQueryBuilder("expirations");
    queryBuilder
      .select([
        "expirations.id",
        "expirations.expirationDate",
        "expirations.expirationType",
        "expirations.isSpecial",
        "expirations.hasBanner",
        "expirations.extraData",
        "reminders.id",
        "reminders.days",
      ])
      .leftJoin("expirations.reminders", "reminders")
      .where("expirations.vehicleId = :vehicleId", { vehicleId })
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);
  
    if (pageOptionsDto.search) {
      queryBuilder.andWhere(
        "LOWER(expirations.expirationType) LIKE LOWER(:search)",
        { search: `%${pageOptionsDto.search}%` },
      );
    }
  
    const expirations = await queryBuilder.getMany();
    const total = await queryBuilder.getCount();
  
    // Ordenar los resultados según el mapeo definido
    expirations.sort((a, b) => {
      return (expirationOrder[a.expirationType.toLowerCase()] || 12) - (expirationOrder[b.expirationType.toLowerCase()] || 12);
    });
  
    const todayBogotaStr = formatInTimeZone(new Date(), "America/Bogota", 'yyyy-MM-dd');
    const todayBogota = new Date(todayBogotaStr + 'T00:00:00Z');
    const defaultTotal = 100; // Días totales para el cálculo
  
    const getColor = (state: string): string => {
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
    };
  
    const processedExpirations = expirations.map((expiration) => {
      let status = "Configurar";
      let percentage = 0;
      const expType = expiration.expirationType.toLowerCase();
  
      if (expType === "pico y placa") {
        status = expiration.extraData?.picoPlacaStatus || "Sin información";
        percentage = 0;
      } else if (expType === "licencia de conducción") {
        status = "No disponible";
        percentage = 0;
      } else if (expType === "multas") {
        const simitData = expiration.extraData?.simitData;
        status =
          simitData && simitData.comparendos_multas > 0
            ? "Tiene multas"
            : "Sin multas";
        percentage = 0;
      } else if (expiration.expirationDate) {
        const timeZone = "America/Bogota";
        const expDateBogotaStr = formatInTimeZone(new Date(expiration.expirationDate), timeZone, 'yyyy-MM-dd');
        const expDateBogota = new Date(expDateBogotaStr + 'T24:00:00Z');
        const daysRemaining = differenceInDays(expDateBogota, todayBogota);
        if (daysRemaining <= 0) {
          status = "Vencido";
          percentage = 0;
        } else {
          status = daysRemaining > 7 ? "Vigente" : "Por vencer";
          const cappedDays = Math.min(daysRemaining, defaultTotal);
          percentage = Math.round((cappedDays / defaultTotal) * 100);
        }
      }
  
      const icon = iconMapping[expType] || "default_icon";
      const color = getColor(status);
      return {
        id: expiration.id,
        expirationDate: expiration.expirationDate,
        expirationType: expiration.expirationType,
        isSpecial: expiration.isSpecial,
        hasBanner: expiration.hasBanner,
        status,
        percentage,
        icon,
        color,
      };
    });
  
    const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });
    return new PageDto(processedExpirations, pageMetaDto);
  }



  

  async update(
    id: number,
    updateExpirationDto: UpdateExpirationDto,
  ): Promise<Expiration> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const expiration = await queryRunner.manager.findOne(Expiration, {
        where: { id },
      });
      if (!expiration) {
        await queryRunner.rollbackTransaction();
        throwCustomError("expiration_not_found");
      }
      expiration.expirationDate =
        updateExpirationDto.expirationDate ?? expiration.expirationDate;
      expiration.isSpecial =
        updateExpirationDto.isSpecial ?? expiration.isSpecial;
      expiration.hasBanner =
        updateExpirationDto.hasBanner ?? expiration.hasBanner;
      await queryRunner.manager.save(expiration);
      await queryRunner.commitTransaction();
      return expiration;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwCustomError("expiration_error");
    } finally {
      await queryRunner.release();
    }
  }

  public async remove(id: number): Promise<void> {
    const expiration = await this.findOne({ id });
    if (!expiration) {
      throwCustomError("expiration_not_found");
    }
    await this.repository.delete(id);
  }

  public async count(vehicleId: number): Promise<number> {
    return this.repository.count({ where: { vehicleId } });
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }
}
