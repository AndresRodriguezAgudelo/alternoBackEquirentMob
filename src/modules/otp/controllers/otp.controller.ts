import { Body, Controller, Post } from "@nestjs/common";
import { OtpService } from "../services/otp.service";
import {
  CreateOtpDto,
  CreateOtpSchema,
  ValidateOtpDto,
  ValidateOtpSchema,
} from "../schemas/otp.schema";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateOtpApiResponse,
  CreateOtpErrorApiResponse,
  ValidateOtpErrorApiResponse,
  ValidateOtpSuccessApiResponse,
  ValidateUserSuccessApiResponse,
} from "../docs/otp.docs";

@ApiTags("Otp")
@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @ApiOperation({
    summary: "Create a code otp",
    description:
      'Create a code otp and send it to the user, the type have to be "login", "register" o "reset"',
  })
  @Post("create")
  @ApiOkResponse(CreateOtpApiResponse)
  @ApiBadRequestResponse(CreateOtpErrorApiResponse)
  async create(
    @Body(new ZodValidationPipe(CreateOtpSchema)) createOtpDto: CreateOtpDto,
  ) {
    return this.otpService.create(createOtpDto);
  }

  @ApiOperation({
    summary: "Validate a code otp",
  })
  @Post("validate")
  @ApiOkResponse(ValidateOtpSuccessApiResponse)
  @ApiBadRequestResponse(ValidateOtpErrorApiResponse)
  async validate(
    @Body(new ZodValidationPipe(ValidateOtpSchema))
    validateOtpDto: ValidateOtpDto,
  ) {
    return this.otpService.validateOtp(validateOtpDto);
  }

  @ApiOperation({
    summary: "Validate a reset code otp",
    description: "Return a userId if the code is valid",
  })
  @Post("validate/reset")
  @ApiOkResponse(ValidateUserSuccessApiResponse)
  async validateReset(
    @Body(new ZodValidationPipe(ValidateOtpSchema))
    validateOtpDto: ValidateOtpDto,
  ) {
    return this.otpService.validateReset(validateOtpDto);
  }
}
