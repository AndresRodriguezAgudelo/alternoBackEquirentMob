import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { OtpRepository } from "../repositories/otp.repository";
import to from "await-to-js";
import { CreateOtpDto, ValidateOtpDto } from "../schemas/otp.schema";
import { throwCustomError } from "@/common/utils/Error";
import { TwilioService } from "@/modules/twilio/service/twilio.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import * as moment from 'moment-timezone';


@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly twilioService: TwilioService,
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createOtpDto: CreateOtpDto) {
    const { phone, type } = createOtpDto;
    
     // 1) Cuenta en UTC
    const otpCount = await this.otpRepository.countRecentOtpsUTC(phone, 1);
    console.log('→ OTP en últimos 5m (UTC):', otpCount);

    if (otpCount >= 2) {
      throw new HttpException(
        'Demasiadas solicitudes de OTP. Por favor, espera unos minutos e inténtalo de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = Math.floor(Math.random() * 9000 + 1000);
    const expiration_time = this.addMinutesToDate(new Date(), 10);
    let otpRecords;
    if (createOtpDto.type == "register") {
      const [error, otpRecord] = await to(
        this.otpRepository.createOtpRegister({
          otp: otp.toString(),
          type,
          expireOn: expiration_time,
          phone,
        }),
      );

      if (error) {
        if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      otpRecords = otpRecord;
      otpRecords["user"] = "";
    } else {
      //get user
      const user = await this.repository.findOne({
        where: { phone },
      });
      console.log("maq", user);
      const [error, otpRecord] = await to(
        this.otpRepository.createOtp({
          otp: otp.toString(),
          type,
          expireOn: expiration_time,
          phone,
        }),
      );

      if (error) {
        if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      otpRecords = otpRecord;
      otpRecords["user"] = user.name;
    }

    // Send OTP to user
    console.log(`OTP: ${otp}`);
    if (type != "reset") {
      await this.twilioService.sendSms(
        `+57${phone}`,
        `Tu código de verificación es: ${otp}`,
      );
    }

    return otpRecords;
  }

  async validateOtp(validateOtp: ValidateOtpDto): Promise<string> {
    const { otp } = validateOtp;

    const [error, userOtp] = await to(this.otpRepository.findByOtp(otp));

    if (error) {
      throwCustomError("not_found_otp");
    }

    if (!userOtp) {
      throwCustomError("not_valid_otp");
    }

    const { expireOn, verified } = userOtp;
    const now = Date.now();

    if (now > expireOn.getTime()) {
      await this.otpRepository.softDelete(userOtp.id);
      throwCustomError("caducate_otp");
    }

    if (verified) {
      throwCustomError("used_otp_again");
    }

    await this.otpRepository.markAsVerified(userOtp.id);
    await this.otpRepository.softDelete(userOtp.id);

    return "OTP validado correctamente";
  }

  async validateReset(validateOtp: ValidateOtpDto): Promise<any> {
    const { otp } = validateOtp;

    const [error, userOtp] = await to(this.otpRepository.findByOtp(otp));

    if (error) {
      throwCustomError("not_found_otp");
    }

    if (!userOtp) {
      throwCustomError("not_valid_otp");
    }

    const { expireOn, verified } = userOtp;
    const now = Date.now();

    if (now > expireOn.getTime()) {
      await this.otpRepository.softDelete(userOtp.id);
      throwCustomError("caducate_otp");
    }

    if (verified) {
      throwCustomError("used_otp_again");
    }

    // Get user by phone
    const user = await this.repository.findOne({
      where: { phone: userOtp.phone },
    });

    if (!user) {
      throwCustomError("user_not_found");
    }

    await this.otpRepository.markAsVerified(userOtp.id);
    await this.otpRepository.softDelete(userOtp.id);

    return {
      userId: user.id,
      validated: true,
    };
  }

  private addMinutesToDate(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  private findOtpByPhone(phone: string) {
    return this.otpRepository.findByPhone(phone);
  }
}
