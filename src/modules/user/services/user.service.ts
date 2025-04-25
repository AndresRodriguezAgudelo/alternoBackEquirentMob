import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import {
  CreateUserDto,
  FiltersDto,
  ResetPasswordDto,
  UpdatePhoneDto,
  UpdateResetPasswordDto,
  UpdateUserDto,
} from "../schemas/user.schema";
import { User } from "../entities/user.entity";
import to from "await-to-js";
import { PageDto } from "@/common";
import { CityService } from "@/modules/city/services/city.service";
import { IUser } from "@/interfaces/user.interface";
import { AuthService } from "@/modules/auth/services/auth.service";
import { JwtService } from "@nestjs/jwt";
import { OtpService } from "@/modules/otp/services/otp.service";
import * as bcrypt from "bcryptjs";
import { FilesService } from "@/modules/files/services/files.service";
import e from "express";
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cityService: CityService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(body: CreateUserDto): Promise<{ user: User; token: string }> {
    try {
      const existingUser = await this.userRepository.findOne({
        email: body.email,
      });
      if (existingUser) {
        throw new HttpException("El usuario ya existe", HttpStatus.BAD_REQUEST);
      }
      const existingPhone = await this.userRepository.findOne({
        phone: body.phone,
      });
      if (existingPhone) {
        throw new HttpException(
          "El télefono ya existe",
          HttpStatus.BAD_REQUEST,
        );
      }
      const city = await this.cityService.findOne(body.cityId);
      if (!city) {
        throw new HttpException("Ciudad no encontrada", HttpStatus.NOT_FOUND);
      }
      const user = new User();
      user.email = body.email;
      user.name = body.name;
      user.cityId = body.cityId;
      user.accepted = body.accepted;
      user.phone = body.phone;
      user.status = false;

      const [error, newUser] = await to(this.userRepository.save(user));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      //send email
      await this.userRepository.sendMailRegister(user);

      //get token
      const res = await this.authService.login(newUser);

      return {
        user: newUser,
        token: res.accessToken,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findAll(pageOptionsDto: FiltersDto): Promise<PageDto<User>> {
    try {
      const [error, data] = await to(
        this.userRepository.findAll(pageOptionsDto),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(data: IUser) {
    try {
      const User = await this.userRepository.findOne(data);
      if (!User) {
        throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
      }
      return User;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async findOneRelations(data: IUser) {
    try {
      const User = await this.userRepository.findOneRelations(data);
      if (!User) {
        throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
      }
      return User;
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<string> {
    try {
      const [error, data] = await to(this.userRepository.update(id, dto));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const [error, data] = await to(this.userRepository.remove(id));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async sendCodeInMail(email: string) {
    try {
      const [error, user] = await to(this.userRepository.findOne({ email }));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      if (!user) {
        throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
      }
      const data = await this.otpService.create({
        type: "reset",
        phone: user.phone,
      });
      await this.userRepository.sendMailCode(user, data.otp);
      return { message: "Código enviado correctamente" };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateResetPassword({
    token,
    newPassword,
    confirmPassword,
  }: UpdateResetPasswordDto) {
    if (newPassword !== confirmPassword) {
      throw new HttpException(
        "Las contraseñas no coinciden",
        HttpStatus.CONFLICT,
      );
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const [error, user] = await to(this.findOne(payload.email));

      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.updatePassword(user.id, hashedPassword);

      return { message: "Contraseña actualizada correctamente" };
    } catch (error) {
      throw new BadRequestException("Token inválido o expirado");
    }
  }

  async resetPassword(body: ResetPasswordDto): Promise<string> {
    try {
      const existingUser = await this.userRepository.findOne({
        email: body.email,
      });
      if (!existingUser) {
        throw new HttpException("El usuario no existe", HttpStatus.NOT_FOUND);
      }
      const generateToken = this.jwtService.sign({ id: existingUser.id });
      const [error, data] = await to(
        this.userRepository.resetPassword(body, generateToken),
      );
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async resetPasswordApp(body: ResetPasswordDto): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({
        email: body.email,
      });

      if (!existingUser) {
        throw new HttpException("El usuario no existe", HttpStatus.NOT_FOUND);
      }

      if (!existingUser.phone) {
        throw new HttpException(
          "El usuario no tiene un número de teléfono",
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.otpService.create({
        phone: existingUser.phone,
        type: "reset",
      });
      return {
        message: "Código de verificación enviado correctamente",
        userId: existingUser.id,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findByPhone(phone: string) {
    try {
      const [error, data] = await to(this.userRepository.findByPhone(phone));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      if (!data)
        throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyEmail(userId: number) {
    try {
      const [error, user] = await to(this.userRepository.findOne({ id: userId }));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      if (!user) {
        throw new HttpException("El usuario no existe", HttpStatus.NOT_FOUND);
      }
      await this.userRepository.updateEmailStatus(user.id, true);
      return { message: "Correo electrónico verificado correctamente" };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }


  async updatePhone(id: number, dto: UpdatePhoneDto): Promise<string> {
    try {
      const [err, res] = await to(
        this.otpService.validateOtp({
          otp: dto.otp,
        }),
      );

      if (err) {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      }
      delete dto.otp;
      const [error] = await to(this.userRepository.update(id, dto));
      if (error) throw new HttpException(error, HttpStatus.BAD_REQUEST);
      return "Usuario actualizado correctamente";
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updatePhoto(file: any, id: number): Promise<any> {
    try {
      console.log('bajaron',file);

      if (!file) {
        throw new HttpException(
          "Imagen principal requerida",
          HttpStatus.BAD_REQUEST,
        );
      }

      const [error, imageUrl] = await to(
        this.filesService.uploadFile({
          file,
          name: file.originalname.trim(),
          category: "profile-photo",
        }),
      );

      if (error) {
        throw new HttpException(
          error || "Error al subir imagen",
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepository.findOne({ id });

      if (!user) {
        throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
      }

      user.photo = imageUrl;

      const [saveError] = await to(this.userRepository.save(user));
      if (saveError) {
        throw new HttpException(saveError, HttpStatus.BAD_REQUEST);
      }

      return {
        message: "Foto de perfil actualizada correctamente",
        data: {
          photo: imageUrl,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Error al actualizar la foto",
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
