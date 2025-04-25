import { Injectable } from "@nestjs/common";
import { DataSource, MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OtpEntity } from "../entities/otp.entity";
import { User } from "@/modules/user/entities/user.entity";
import { throwCustomError } from "@/common/utils/Error";
import * as moment from 'moment-timezone';

@Injectable()
export class OtpRepository {
  constructor(
    @InjectRepository(OtpEntity)
    private readonly repository: Repository<OtpEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async countRecentOtpsUTC(
    phone: string,
    minutesWindow = 5,
  ): Promise<number> {
    return this.repository
      .createQueryBuilder('otp')
      .where('otp.phone = :phone', { phone })
      // DATEDIFF en minutos entre createdAt y GETUTCDATE()
      .andWhere('DATEDIFF(MINUTE, otp.createdAt, GETUTCDATE()) < :window', {
        window: minutesWindow,
      })
      .getCount();
  }
  

  async createOtp(otpData: Partial<OtpEntity>): Promise<OtpEntity> {
    const { phone } = otpData;

    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { phone } });

    if (!user) {
      throwCustomError("not_found_user");
    }

    if (user.deletedAt !== null) {
      throwCustomError("user_is_inactive");
    }
    const otp = this.repository.create(otpData);
    return await this.repository.save(otp);
  }

  async createOtpRegister(otpData: Partial<OtpEntity>): Promise<OtpEntity> {
    const otp = this.repository.create(otpData);
    return await this.repository.save(otp);
  }

  async findByOtp(otp: string): Promise<OtpEntity | null> {
    return await this.repository.findOne({ where: { otp } });
  }

  async markAsVerified(id: number): Promise<void> {
    await this.repository.update(id, { verified: true });
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByPhone(phone: string): Promise<OtpEntity | null> {
    return await this.repository.findOne({ where: { phone } });
  }
}
