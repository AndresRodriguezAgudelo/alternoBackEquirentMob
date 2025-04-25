import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PeakPlateRestriction } from "../entities/peak-plate.entity";

@Injectable()
export class PeakPlateRepository {
  constructor(
    @InjectRepository(PeakPlateRestriction)
    private readonly repository: Repository<PeakPlateRestriction>,
  ) {}

  async findOneByCityPlateYearMonth(
    city: string,
    plate: string,
    year: number,
    month: number,
  ): Promise<PeakPlateRestriction | undefined> {
    return this.repository.findOne({ where: { city, plate, year, month } });
  }

  async createAndSave(
    data: Partial<PeakPlateRestriction>,
  ): Promise<PeakPlateRestriction> {
    const newRecord = this.repository.create(data);
    return this.repository.save(newRecord);
  }

  async save(record: PeakPlateRestriction): Promise<PeakPlateRestriction> {
    return this.repository.save(record);
  }

  async getLatestByPlate(
    plate: string,
  ): Promise<PeakPlateRestriction | undefined> {
    return await this.repository
      .createQueryBuilder("p")
      .where("p.plate = :plate", { plate })
      .orderBy("p.id", "DESC")
      .addOrderBy("p.month", "DESC")
      .getOne();
  }
}
