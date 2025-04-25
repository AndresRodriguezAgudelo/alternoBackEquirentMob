import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { IUser } from '@/interfaces/user.interface';
import { LoginDto, LoginEmailDto } from '../schemas/auth.schemas';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
        const user: IUser = { id: 1, email: 'test@example.com' } as IUser;
        const data: LoginDto = { phone: '1234567890', otp: '1234' };
      
        const result = { user, accessToken: 'mockToken' };
      
        service.login.mockResolvedValue(result); // Simula que el servicio login retorna un objeto envuelto en una Promise
      
        const response = await controller.login(user, data); // Llamada al controller
      
        expect(response).toEqual(result); // Usar .toEqual() en vez de .toBe()
        expect(service.login).toHaveBeenCalledWith(user); // Verifica que se llama correctamente con el parámetro esperado
      });
      

    it('should handle login errors', async () => {
      const user: IUser = { id: 1, email: 'test@example.com' } as IUser;
      const data: LoginDto = { phone: '1234567890', otp: '1234' };

      service.login.mockImplementation(() => { throw new Error('Login failed'); });

      const response = await controller.login(user, data);
      expect(response).toEqual({ statusCode: 500, message: new Error('Login failed') });
    });
  });

  describe('loginEmail', () => {
    it('should log in a user via email successfully', async () => {
      const user: IUser = { id: 1, email: 'test@example.com' } as IUser;
      const data: LoginEmailDto = { email: 'test@example.com', password: 'password' };

      const result = { user, accessToken: 'mockToken' };
      service.login.mockResolvedValue(result);

      expect(await controller.loginEmail(user, data)).toBe(result);
      expect(service.login).toHaveBeenCalledWith(user);
    });

    it('should handle login email errors', async () => {
      const user: IUser = { id: 1, email: 'test@example.com' } as IUser;
      const data: LoginEmailDto = { email: 'test@example.com', password: 'password' };

      service.login.mockImplementation(() => { throw new Error('Login failed'); });

      const response = await controller.loginEmail(user, data);
      expect(response).toEqual({ statusCode: 500, message: new Error('Login failed') });
    });
  });

  describe('renderResetPasswordPage', () => {
    it('should return the reset password page with the token', async () => {
      const token = 'valid-token';

      const result = await controller.renderResetPasswordPage(token);
      expect(result).toEqual({ token });
    });

    it('should throw BadRequestException if token is not provided', async () => {
      await expect(controller.renderResetPasswordPage('')).rejects.toThrow(BadRequestException);
    });
  });
});
