import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { UserVehicle } from "@/modules/user-vehicle/entities/userVehicle.entity";

@Injectable()
export class UserVehicleRepository {
  constructor(
    @InjectRepository(UserVehicle)
    private readonly repository: Repository<UserVehicle>,
  ) {}

  public count(userId: number): Promise<number> {
    return this.repository.count({
      where: {
        userId,
      },
    });
  }

  public async save(vehicle: UserVehicle): Promise<UserVehicle> {
    return this.repository.save(vehicle);
  }

  public async removeByVehicleId(vehicleId: number): Promise<void> {
    await this.repository.delete({ vehicleId });
  }
}
