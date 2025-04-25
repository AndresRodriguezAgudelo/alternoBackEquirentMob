import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserRepository } from "./repositories/user.repository";
import { MailModule } from "@/config/mail/mail.module";
import { TemplatesModule } from "../templates/templates.module";
import { CityModule } from "../city/city.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@/config/passport/passport.module";
import { OtpModule } from "../otp/otp.module";
import { FilesModule } from "../files/files.module";
import { AuthModule } from "../auth/auth.module";
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
    TemplatesModule,
    CityModule,
    forwardRef(() => AuthModule),
    PassportModule,
    JwtModule,
    OtpModule,
    FilesModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
