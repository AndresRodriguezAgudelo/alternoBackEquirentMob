import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { OtpRepository } from '../repositories/otp.repository';
import { TwilioService } from '@/modules/twilio/service/twilio.service';
import { Repository } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateOtpDto, ValidateOtpDto } from '../schemas/otp.schema';
import { HttpException } from '@nestjs/common';

jest.mock('../repositories/otp.repository');


describe('OtpService', () => {
  let service: OtpService;
  let otpRepository: jest.Mocked<OtpRepository>;
  let twilioService: jest.Mocked<TwilioService>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: OtpRepository,
          useValue: {
            createOtp: jest.fn(),
            createOtpRegister: jest.fn(),
            findByOtp: jest.fn(),
            findByPhone: jest.fn(),
            markAsVerified: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: TwilioService,
          useValue: {
            sendSms: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpRepository = module.get(OtpRepository);
    twilioService = module.get(TwilioService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create an OTP and send via Twilio', async () => {
      const createOtpDto: CreateOtpDto = { phone: '1234567890', type: 'login' };
  
      const userMock = { id: 1, name: 'Test User', phone: '1234567890', email: 'test@example.com', accepted: true, city: { id: 1, cityName: 'Test City', users: [], vehicles: [] }, cityId: 1, userVehicles: [], photo: null, createdAt: new Date(), updatedAt: new Date(), password: 'test', verify: true, status: true };
      userRepository.findOne.mockResolvedValue(userMock); // Asegúrate de que esto devuelva un usuario válido.
  
      otpRepository.createOtp.mockResolvedValue({
        otp: '1234',
        expireOn: new Date(),
        phone: '1234567890',
        type: 'login',
        verified: false,
        id: 1,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      });
  
      await service.create(createOtpDto);
  
      expect(twilioService.sendSms).toHaveBeenCalled();
      expect(otpRepository.createOtp).toHaveBeenCalled();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '1234567890' },
      });
    });
  });

  describe('validateOtp', () => {
    it('should validate OTP successfully', async () => {
      const validateOtpDto: ValidateOtpDto = { otp: '1234' };
      const userOtp = { otp: '1234', expireOn: new Date(Date.now() + 60000), verified: false, id: 1, type: 'login', phone: '1234567890' };

      otpRepository.findByOtp.mockResolvedValue(userOtp);
      otpRepository.markAsVerified.mockResolvedValue(null);
      otpRepository.softDelete.mockResolvedValue(null);

      const result = await service.validateOtp(validateOtpDto);

      expect(result).toBe('OTP validado correctamente');
      expect(otpRepository.markAsVerified).toHaveBeenCalledWith(1);
      expect(otpRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('validateReset', () => {
    it('should validate a reset OTP and return userId', async () => {
      const validateOtpDto: ValidateOtpDto = { otp: '1234' };
      const userOtp = { otp: '1234', expireOn: new Date(Date.now() + 60000), verified: false, id: 1, type: 'reset', phone: '1234567890' };
      const user = { id: 1, email: 'test@example.com', name: 'Test User', accepted: true, city: { id: 1, cityName: 'Test City', users: [], vehicles: [] }, cityId: 1, userVehicles: [], photo: null, phone: '1234567890', createdAt: new Date(), updatedAt: new Date(), password: 'test', verify: true, status: true };

      otpRepository.findByOtp.mockResolvedValue(userOtp);
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.validateReset(validateOtpDto);

      expect(result).toEqual({ userId: 1, validated: true });
      expect(otpRepository.markAsVerified).toHaveBeenCalledWith(1);
      expect(otpRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
