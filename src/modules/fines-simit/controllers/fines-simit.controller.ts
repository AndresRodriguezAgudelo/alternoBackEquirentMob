import { Controller, Get, Param } from "@nestjs/common";
import { FinesSimitService } from "../services/fines-simit.service";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  SimitBadRequestResponse,
  SimitSuccessResponse,
} from "../docs/fines-simit.doc";
import { Auth } from "@/common/decorators/auth.decorators";
import { IUser } from "@/interfaces/user.interface";
import { User } from "@/common/decorators/user.decorators";

@ApiTags("Fines SIMIT")
@Auth()
@Controller("fines-simit")
export class FinesSimitController {
  constructor(private readonly finesSimitService: FinesSimitService) {}

  @ApiOperation({
    summary: "Get the fines of a person or vehicle from the SIMIT platform",
    description:
      "This endpoint allows you to get the fines of a person or vehicle from the SIMIT platform by scraping the information from the website.",
  })
  @ApiOkResponse(SimitSuccessResponse)
  @ApiBadRequestResponse(SimitBadRequestResponse)
  @Get(":search")
  private async getFines(@User() user: IUser, @Param("search") search: string) {
    return await this.finesSimitService.getFines(search, user);
  }
}
