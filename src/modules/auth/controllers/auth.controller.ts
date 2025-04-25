import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Render,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { User } from "src/common/decorators/user.decorators";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import { IUser } from "@/interfaces/user.interface";
import { LoginDto, LoginEmailDto } from "../schemas/auth.schemas";
import { OtpAuth } from "@/common/decorators/otpAuth.decorator";
import { LocalGuard } from "@/config/passport/guards/local.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "Login Endpoint",
    description: "Endpoint to authenticate and log in a user.",
  })
  @OtpAuth()
  login(@User() user: IUser, @Body() data: LoginDto) {
    try {
      return this.authService.login(user);
    } catch (err) {
      return {
        statusCode: 500,
        message: err,
      };
    }
  }

  @Post("login-email")
  @ApiOperation({
    summary: "Login Endpoint",
    description: "Endpoint to authenticate and log in a user.",
  })
  @UseGuards(LocalGuard)
  loginEmail(@User() user: IUser, @Body() data: LoginEmailDto) {
    try {
      return this.authService.login(user);
    } catch (err) {
      return {
        statusCode: 500,
        message: err,
      };
    }
  }

  @Get("reset-password")
  @Render("reset-password")
  async renderResetPasswordPage(@Query("token") token: string) {
    if (!token) {
      throw new BadRequestException("Token de recuperación es requerido");
    }
    return { token };
  }
}
