import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
} from "@nestjs/common";
import { UserService } from "../services/user.service";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateUserDto,
  CreateUserSchema,
  FiltersDto,
  RecoveryAccount,
  RecoveryAccountDto,
  ResetPasswordDto,
  ResetPasswordSchema,
  UpdatePhoneDto,
  UpdatePhoneSchema,
  UpdateResetPasswordDto,
  UpdateResetPasswordSchema,
  UpdateUserDto,
  UpdateUserSchema,
} from "../schemas/user.schema";
import {
  CreateUserErrorApiResponse,
  CreateUserSuccessApiResponse,
  GetUserByIdApiResponse,
  GetUsersApiResponse,
  ResetPasswordErrorApiResponse,
  ResetPasswordSuccessApiResponse,
  SendVerificationCodeSuccessApiResponse,
  UpdateProfilePhotoApiResponse,
  UpdateUserErrorApiResponse,
  UpdateUserSuccessApiResponse,
} from "../docs/user.doc";
import { Auth } from "@/common/decorators/auth.decorators";
import { IUser } from "@/interfaces/user.interface";
import { User } from "@/common/decorators/user.decorators";
import { Response } from "express";
import { FileDto } from "@/modules/files/schemas/files.schema";
import { PhotoFile } from "@/common/decorators/photoFile.decorators";
@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: "Create a new user",
    description:
      "After creating the user, an email will be sent to the user with a link to activate the account",
  })
  @ApiOkResponse(CreateUserSuccessApiResponse)
  @ApiBadRequestResponse(CreateUserErrorApiResponse)
  @Post()
  private async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) createuserDto: CreateUserDto,
  ) {
    return await this.userService.create(createuserDto);
  }

  @Auth()
  @ApiOperation({
    summary: "Get all users paginated",
  })
  @ApiOkResponse(GetUsersApiResponse)
  @Get()
  private async findAll(@Query() pageOptionsDto: FiltersDto) {
    return await this.userService.findAll(pageOptionsDto);
  }

  @Auth()
  @ApiOperation({
    summary: "Get a user by id",
  })
  @ApiOkResponse(GetUserByIdApiResponse)
  @Get(":id")
  private async findOne(@Param("id") id: number) {
    return await this.userService.findOne({ id: Number(id) });
  }

  //@Auth()
  @ApiOperation({
    summary: "Update a user by id",
  })
  @ApiOkResponse(UpdateUserSuccessApiResponse)
  @ApiBadRequestResponse(UpdateUserErrorApiResponse)
  @Patch(":id")
  private async update(
    @Param("id") id: number,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateuserDto: UpdateUserDto,
  ) {
    return await this.userService.update(Number(id), updateuserDto);
  }

  @Auth()
  @ApiOperation({
    summary: "Delete a user by id",
  })
  @Delete(":id")
  private async remove(@Param("id") id: number) {
    return await this.userService.remove(Number(id));
  }

  @ApiOperation({
    summary: "Reset password",
  })
  @ApiOkResponse(ResetPasswordSuccessApiResponse)
  @ApiBadRequestResponse(ResetPasswordErrorApiResponse)
  @Post("reset-password")
  private async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema))
    resetPasswordDto: ResetPasswordDto,
  ) {
    return await this.userService.resetPassword(resetPasswordDto);
  }

  @Post("update-reset-password")
  private async resetPasswordPut(
    @Body(new ZodValidationPipe(UpdateResetPasswordSchema))
    UpdateResetPasswordSchema: UpdateResetPasswordDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.userService.updateResetPassword(
        UpdateResetPasswordSchema,
      );
      return res
        .status(HttpStatus.OK)
        .render("success", { message: result.message });
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .render("error", { message: "Error al actualizar la contraseña" });
    }
  }

  @ApiOperation({
    summary: "Reset password by phone app",
  })
  @ApiOkResponse(SendVerificationCodeSuccessApiResponse)
  @Post("reset-password-app")
  private async resetPasswordApp(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.userService.resetPasswordApp(resetPasswordDto);
  }

  @Auth()
  @ApiOperation({
    summary: "Get user by phone number",
  })
  @Get("phone/:phone")
  private async findByPhone(@Param("phone") phone: string) {
    return await this.userService.findByPhone(phone);
  }

  @ApiOperation({
    summary: "Update phone number by user id",
  })
  @Patch("phone/:userId")
  @ApiOkResponse(UpdateUserSuccessApiResponse)
  @Patch("/phone/:userId")
  private async updatePhone(
    @Param("userId") id: number,
    @Body(new ZodValidationPipe(UpdatePhoneSchema))
    updatePhoneDto: UpdatePhoneDto,
  ) {
    return await this.userService.updatePhone(Number(id), updatePhoneDto);
  }

  @ApiOperation({
    summary: "Recover account by email",
  })
  @Post("/recovery/account")
  private async recovertyAccountByEmail(
    @Body(new ZodValidationPipe(RecoveryAccount))
    recoveryAccount: RecoveryAccountDto,
  ) {
    return await this.userService.sendCodeInMail(recoveryAccount.email);
  }

  @Auth()
  @PhotoFile()
  @ApiOkResponse(UpdateProfilePhotoApiResponse)
  @ApiOperation({
    summary: "Update profile photo",
  })
  @Patch("photo/update")
  async updatePhoto(@UploadedFile() file: FileDto, @User() user: IUser) {
    return await this.userService.updatePhoto(file, user.id);
  }


  @Get("verify/email")
  async verifyEmail(@Query("userId") userId: number, @Res() res: Response,) {
    if (!userId) {
      throw new BadRequestException("Id de usuario es requerido");
    }

    await this.userService.verifyEmail(userId);

    return res
      .status(HttpStatus.OK)
      .render("registerSuccess", { message: "Correo electrónico verificado correctamente" });
  }


}


