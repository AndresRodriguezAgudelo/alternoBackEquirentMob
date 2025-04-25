import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PageDto, PageMetaDto, PageOptionsDto } from "@/common";
import { throwCustomError } from "@/common/utils/Error";
import { Vehicle } from "../entities/vehicle.entity";
import { IVehicle } from "@/interfaces/vehicle.interface";
import { UpdateVehicleDto } from "../schemas/vehicle.schema";
import { IUser } from "@/interfaces/user.interface";
import { UserVehicleRepository } from "./userVehicle.repository";

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repository: Repository<Vehicle>,
    private readonly dataSource: DataSource,
    private readonly userVehicleRepository: UserVehicleRepository,
  ) {}

  public async totalByNumberDocument(numberDocument: string): Promise<number> {
    return this.repository.count({
      where: {
        numberDocument,
      },
    });
  }

  public async save(vehicle: Vehicle): Promise<Vehicle> {
    return this.repository.save(vehicle);
  }

  public async findOne(data: IVehicle): Promise<Vehicle> {
    const Vehicle = await this.repository.findOne({
      where: { ...data },
    });
    return Vehicle;
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    userId: number,
  ): Promise<PageDto<Vehicle>> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder("vehicle")
        .select(["vehicle.id", "vehicle.licensePlate", "vehicle.model"])
        .innerJoin("vehicle.userVehicles", "userVehicle")
        .where("userVehicle.userId = :userId", { userId })
        .orderBy("vehicle.licensePlate", pageOptionsDto.order)
        .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
        .take(pageOptionsDto.take);

      if (pageOptionsDto.search) {
        queryBuilder.andWhere(
          "LOWER(vehicle.licensePlate) LIKE LOWER(:search)",
          {
            search: `%${pageOptionsDto.search}%`,
          },
        );
      }

      const [vehicles, total] = await queryBuilder.getManyAndCount();

      const pageMetaDto = new PageMetaDto({ total, pageOptionsDto });

      return new PageDto(vehicles, pageMetaDto);
    } catch (error) {
      throwCustomError("Vehicle_error");
    }
  }

  async update(id: number, updateBranch: UpdateVehicleDto): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: { id },
      });

      if (!vehicle) {
        throwCustomError("vehicle_not_found");
      }

      const existingVehicle = await queryRunner.manager.findOne(Vehicle, {
        where: { licensePlate: updateBranch.licensePlate },
      });

      if (existingVehicle && existingVehicle.id !== id) {
        throwCustomError("vehicle_exists");
      }

      await queryRunner.manager.update(Vehicle, id, updateBranch);

      await queryRunner.manager.save(vehicle);

      await queryRunner.commitTransaction();

      return "Vehiculo actualizado correctamente";
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwCustomError("Vehicle_error");
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, user: IUser): Promise<void> {
    const vehicle = await this.repository.findOne({ where: { id } });

    if (!vehicle) {
      throwCustomError("vehicle_not_found");
    }

    const userVehicle = await this.userVehicleRepository.count(user.id);
    if (!userVehicle) {
      throw new HttpException(
        "No tienes permiso para eliminar este vehículo",
        HttpStatus.FORBIDDEN,
      );
    }

    await this.userVehicleRepository.removeByVehicleId(id);

    await this.repository.delete(id);
  }

  async getVehicleHistory(plate: string): Promise<Vehicle> {
    const vehicle = await this.repository.findOne({
      where: { licensePlate: plate },
    });

    if (!vehicle) {
      throwCustomError("vehicle_not_found");
    }

    return vehicle;
  }

  async getVehicleAccidents(plate: string): Promise<Vehicle> {
    const vehicle = await this.repository.findOne({
      where: { licensePlate: plate },
    });

    if (!vehicle) {
      throwCustomError("vehicle_not_found");
    }

    return vehicle;
  }

  async getVehiclePrecautionaryMeasures(plate: string): Promise<Vehicle> {
    const vehicle = await this.repository.findOne({
      where: { licensePlate: plate },
    });

    if (!vehicle) {
      throwCustomError("vehicle_not_found");
    }

    return vehicle;
  }

  async getVehicleTransferHistory(plate: string): Promise<Vehicle> {
    const vehicle = await this.repository.findOne({
      where: { licensePlate: plate },
    });

    if (!vehicle) {
      throwCustomError("vehicle_not_found");
    }

    return vehicle;
  }
}
