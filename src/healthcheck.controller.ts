import { Controller, Get } from "@nestjs/common";

@Controller("healthcheck")
export class HealthcheckController {
  @Get()
  healthcheck() {
    return { status: 200, success: true };
  }
}
