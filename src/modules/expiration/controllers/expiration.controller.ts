import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ExpirationService } from "../services/expiration.service";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateExpirationDto,
  CreateExpirationSchema,
  UpdateExpirationDto,
  UpdateExpirationSchema,
} from "../schemas/expiration.schema";
import { PageOptionsDto } from "@/common";
import {
  CombinedGetOneExpirationResponse,
  CreateExpirationResponse,
  GetAllExpirationsResponse,
  GetErrorReloadResponse,
  GetReloadExpirationResponse,
  UpdateExpirationResponse,
} from "../docs/expiration.doc";
import { Auth } from "@/common/decorators/auth.decorators";
import { User } from "@/common/decorators/user.decorators";
import { IUser } from "@/interfaces/user.interface";

Auth()
@ApiTags("Expiration")
@Controller("expiration")
export class ExpirationController {

  private logger = new Logger(ExpirationController.name);

  constructor(private readonly expirationService: ExpirationService) {}

  @ApiOperation({
    summary: "Create a new expiration",
    description:
      "Create a new expiration with the given data, extra data is optional depending on the expiration type",
  })
  @ApiOkResponse(CreateExpirationResponse)
  @Post()
  private async create(
    @Body(new ZodValidationPipe(CreateExpirationSchema))
    createExpirationDto: CreateExpirationDto,
  ) {
    return await this.expirationService.create(createExpirationDto);
  }

  @ApiOperation({
    summary: "Get all expirations paginated",
    description: "Get all expirations paginated",
  })
  @ApiOkResponse(GetAllExpirationsResponse)
  @Get(":vehicleId")
  private async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Param("vehicleId") vehicleId: number,
  ) {
    return await this.expirationService.findAll(pageOptionsDto, vehicleId);
  }

  @ApiOperation({
    summary: "Get one expiration",
    description: `Get one expiration by id, USE FOR: 
    "Extintor",
    ""              
    `,
  })
  @ApiOkResponse(CombinedGetOneExpirationResponse)
  @Get(":id/one")
  private async findOne(@Param("id") id: number) {
    return await this.expirationService.findOne(id);
  }

  @ApiOperation({
    summary: "Update a expiration by id",
  })
  @ApiOkResponse(UpdateExpirationResponse)
  @Patch(":id")
  private async update(
    @Param("id") id: number,
    @Body(new ZodValidationPipe(UpdateExpirationSchema))
    updateExpirationDto: UpdateExpirationDto,
  ) {
    this.logger.log('Updating expiration', updateExpirationDto);
    return await this.expirationService.update(Number(id), updateExpirationDto);
  }

  @ApiOperation({
    summary: "Delete a expiration by id",
  })
  @Delete(":id/delete")
  private async delete(@Param("id") id: number) {
    return await this.expirationService.delete(Number(id));
  }

  @ApiOperation({
    summary: "Reload expiration data",
  })
  @Auth()
  @Get("/reload-expiration/:name/:expirationId")
  @ApiOkResponse(GetReloadExpirationResponse)
  @ApiBadRequestResponse(GetErrorReloadResponse)
  private async reloadExpiration(
    @User() user: IUser,
    @Param("name") name: string,
    @Param("expirationId") expirationId: number
  ) {
    return await this.expirationService.reloadExpiration(name, user.id, expirationId);
  }



}
