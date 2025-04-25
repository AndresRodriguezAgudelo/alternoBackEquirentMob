import { OtpGuard } from "@/config/passport/guards/opt.guard";
import { applyDecorators, UseGuards } from "@nestjs/common";

export function OtpAuth() {
  return applyDecorators(UseGuards(OtpGuard));
}
