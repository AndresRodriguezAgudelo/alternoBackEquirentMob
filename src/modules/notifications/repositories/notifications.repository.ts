import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DeviceRegistration } from "../entities/device-registration.entity";

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(DeviceRegistration)
    private readonly repository: Repository<DeviceRegistration>,
  ) {}

  async createAndSave(
    data: Partial<DeviceRegistration>,
  ): Promise<DeviceRegistration> {
    const registration = this.repository.create(data);
    return this.repository.save(registration);
  }

  async findByUser(userId: number): Promise<DeviceRegistration[]> {
    return (await this.repository.find({ where: { userId } })).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
