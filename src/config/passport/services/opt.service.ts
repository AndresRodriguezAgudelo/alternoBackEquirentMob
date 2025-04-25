import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "@/modules/auth/services/auth.service";

@Injectable()
export class OtpStrategy extends PassportStrategy(Strategy, "otp") {
  constructor(private authService: AuthService) {
    super({
      usernameField: "phone",
      passwordField: "otp",
    });
  }

  async validate(phone: string, otp: string) {
    const user = await this.authService.validateUser(phone, otp);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
