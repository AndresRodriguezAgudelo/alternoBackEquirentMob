import { Test, TestingModule } from '@nestjs/testing';
import { OtpRepository } from './otp.repository';
import { Repository, DataSource } from 'typeorm';
import { OtpEntity } from '../entities/otp.entity';
import { User } from '@/modules/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { throwCustomError } from '@/common/utils/Error';

jest.mock('@/common/utils/Error');


describe('OtpRepository', () => {
  let repository: OtpRepository;
  let otpRepositoryMock: jest.Mocked<Repository<OtpEntity>>;
  let userRepositoryMock: jest.Mocked<Repository<User>>;
  let dataSourceMock: jest.Mocked<DataSource>;

  beforeEach(async () => {
    otpRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    userRepositoryMock = {
      findOne: jest.fn(),
    } as any;

    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(userRepositoryMock),
    } as any;

    repository = new OtpRepository(otpRepositoryMock, dataSourceMock);
  });

  describe('createOtp', () => {
    it('should create an OTP', async () => {
      const otpData = { phone: '1234567890', otp: '1234' };
      const user = { id: 1, name: 'Test User', phone: '1234567890', email: 'test@example.com', accepted: true, city: { id: 1, cityName: 'Test City', users: [], vehicles: [] }, cityId: 1, userVehicles: [], photo: null, createdAt: new Date(), updatedAt: new Date(), password: 'test', verify: true, status: true };
      
      userRepositoryMock.findOne.mockResolvedValue(user);
      otpRepositoryMock.create.mockReturnValue(otpData as OtpEntity);
      otpRepositoryMock.save.mockResolvedValue(otpData as OtpEntity);

      const result = await repository.createOtp(otpData);

      expect(result).toEqual(otpData);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { phone: '1234567890' } });
      expect(otpRepositoryMock.save).toHaveBeenCalled();
    });
  });

  describe('createOtpRegister', () => {
    it('should create an OTP for registration', async () => {
      const otpData = { phone: '1234567890', otp: '1234' };
      otpRepositoryMock.create.mockReturnValue(otpData as OtpEntity);
      otpRepositoryMock.save.mockResolvedValue(otpData as OtpEntity);

      const result = await repository.createOtpRegister(otpData);

      expect(result).toEqual(otpData);
      expect(otpRepositoryMock.save).toHaveBeenCalled();
    });
  });

  describe('findByOtp', () => {
    it('should find an OTP by code', async () => {
      const otp = { otp: '1234' } as OtpEntity;
      otpRepositoryMock.findOne.mockResolvedValue(otp);

      const result = await repository.findByOtp('1234');

      expect(result).toEqual(otp);
      expect(otpRepositoryMock.findOne).toHaveBeenCalledWith({ where: { otp: '1234' } });
    });
  });

  describe('markAsVerified', () => {
    it('should mark an OTP as verified', async () => {
      await repository.markAsVerified(1);
      expect(otpRepositoryMock.update).toHaveBeenCalledWith(1, { verified: true });
    });
  });

  describe('softDelete', () => {
    it('should soft delete an OTP', async () => {
      await repository.softDelete(1);
      expect(otpRepositoryMock.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('findByPhone', () => {
    it('should find an OTP by phone', async () => {
      const otp = { phone: '1234567890' } as OtpEntity;
      otpRepositoryMock.findOne.mockResolvedValue(otp);

      const result = await repository.findByPhone('1234567890');

      expect(result).toEqual(otp);
      expect(otpRepositoryMock.findOne).toHaveBeenCalledWith({ where: { phone: '1234567890' } });
    });
  });
});
