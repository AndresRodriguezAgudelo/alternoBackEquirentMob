import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from '../services/otp.service';
import { CreateOtpDto, ValidateOtpDto } from '../schemas/otp.schema';

describe('OtpController', () => {
  let controller: OtpController;
  let service: jest.Mocked<OtpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        {
          provide: OtpService,
          useValue: {
            create: jest.fn(),
            validateOtp: jest.fn(),
            validateReset: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    service = module.get(OtpService);
  });

  describe('create', () => {
    it('should create a new OTP code', async () => {
      const createOtpDto: CreateOtpDto = { phone: '1234567890', type: 'login' };
      const result = { success: true, message: 'OTP sent successfully' };

      service.create.mockResolvedValue(result);

      expect(await controller.create(createOtpDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createOtpDto);
    });
  });

  describe('validate', () => {
    it('should validate an OTP code', async () => {
      const validateOtpDto: ValidateOtpDto = { otp: '123456' };
      const result = 'OTP validado correctamente';
      service.validateOtp.mockResolvedValue(result);

      expect(await controller.validate(validateOtpDto)).toEqual(result);
      expect(service.validateOtp).toHaveBeenCalledWith(validateOtpDto);
    });
  });

  describe('validateReset', () => {
    it('should validate a reset OTP code', async () => {
      const validateOtpDto: ValidateOtpDto = { otp: '123456' };
      const result = 'OTP validado correctamente';

      service.validateReset.mockResolvedValue(result);

      expect(await controller.validateReset(validateOtpDto)).toEqual(result);
      expect(service.validateReset).toHaveBeenCalledWith(validateOtpDto);
    });
  });
});
