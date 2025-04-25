import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { UserModule } from "../user/user.module";
import { PassportModule } from "@/config/passport/passport.module";
import { OtpStrategy } from "@/config/passport/services/opt.service";
import { OtpGuard } from "@/config/passport/guards/opt.guard";
import { OtpModule } from "../otp/otp.module";
import { JwtService } from "@/config/passport/services/jwt.service";
import { LocalService } from "@/config/passport/services/local.service";

@Module({
  imports: [forwardRef(() => UserModule), PassportModule, OtpModule],
  controllers: [AuthController],
  providers: [AuthService, OtpStrategy, OtpGuard, JwtService, LocalService],
  exports: [AuthService],
})
export class AuthModule {}
