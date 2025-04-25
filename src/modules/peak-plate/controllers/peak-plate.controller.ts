import { Controller, Get, Param } from "@nestjs/common";
import { PeakPlateService } from "../services/peak-plate.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetPeakPlateResponse } from "../docs/peak-plate.doc";
import { Auth } from "@/common/decorators/auth.decorators";

@Auth()
@ApiTags("Peak Plate")
@Controller("peak-plate")
export class PeakPlateController {
  constructor(private readonly peakPlateService: PeakPlateService) {}

  @ApiOperation({
    summary: "Obtener el pico y placa de una ciudad específica",
    description:
      "Retorna el pico y placa de una ciudad específica para los 31 días del mes",
  })
  @ApiOkResponse(GetPeakPlateResponse)
  @Get(":city/:plate")
  async get(
    @Param("city") city: string,
    @Param("plate") plate: string,
  ): Promise<any> {
    return this.peakPlateService.get(city, plate);
  }
}
