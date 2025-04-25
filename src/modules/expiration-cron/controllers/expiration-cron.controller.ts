import { Controller, Get } from "@nestjs/common";
import { ExpirationCronService } from "../services/expiration-cron.service";
import { Auth } from "@/common/decorators/auth.decorators";

@Auth()
@Controller("expiration-cron")
export class ExpirationCronController {
  constructor(private readonly expirationCronService: ExpirationCronService) {}

  @Get("run-expirations")
  async runExpirations() {
    await this.expirationCronService.handleExpirations();
    return { message: "Proceso de expiraciones ejecutado correctamente." };
  }
}
