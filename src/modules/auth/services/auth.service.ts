import {
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { compareSync } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "@/modules/user/services/user.service";
import { IUser } from "@/interfaces/user.interface";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(email: string, pass: string) {
    const user = await this.userService.findOne({ email });
    if (!user) throw new NotFoundException("Usuario no encontrado");

    if (!compareSync(pass, user.password))
      throw new NotAcceptableException(
        "Contraseña incorrecta. Inténtalo nuevamente o recupera la contraseña",
      );

    let { password, ...rest } = user;

    return rest;
  }

  async validateUser(phone: string, otp: string) {
    const user = await this.userService.findOne({ phone });
    if (!user) throw new NotFoundException("Usuario no encontrado");
    return user;
  }

  async login(user: IUser) {
    const payload = { sub: user.id };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getTokenRegisteredUser(userId: number) {
    const user = await this.userService.findOne({ id: userId });
    if (!user) throw new NotFoundException("Usuario no encontrado");
    return this.jwtService.sign({ sub: user.id });
  }
}
