import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { VehicleService } from "../services/vehicle.service";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateVehicleDto,
  CreateVehicleSchema,
  UpdateVehicleDto,
  UpdateVehicleSchema,
} from "../schemas/vehicle.schema";
import { PageOptionsDto } from "@/common";
import {
  CreateVehicleBadRequestResponse,
  CreateVehicleSuccessResponse,
  GetAllVehiclesResponse,
  GetVehicleAccidentsResponse,
  GetVehicleByIdResponse,
  GetVehicleHistoryResponse,
  GetVehiclePrecautionaryMeasuresResponse,
  GetVehicleTransferHistoryResponse,
  UpdateVehicleSuccessResponse,
} from "../docs/vehicle.doc";
import { Auth } from "@/common/decorators/auth.decorators";
import { IUser } from "@/interfaces/user.interface";
import { User } from "@/common/decorators/user.decorators";
@ApiTags("Vehicle")
@Auth()
@Controller("vehicle")
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @ApiOperation({
    summary: "Create a vehicle",
  })
  @ApiOkResponse(CreateVehicleSuccessResponse)
  @ApiBadRequestResponse(CreateVehicleBadRequestResponse)
  @Post()
  private async create(
    @User() user: IUser,
    @Body(new ZodValidationPipe(CreateVehicleSchema))
    createVehicleDto: CreateVehicleDto,
  ) {
    return await this.vehicleService.create(createVehicleDto, user);
  }

  @ApiOperation({
    summary: "Get all vehicles paginated",
  })
  @ApiOkResponse(GetAllVehiclesResponse)
  @Get()
  private async findAll(
    @User() user: IUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return await this.vehicleService.findAll(pageOptionsDto, user);
  }

  @ApiOperation({
    summary: "Get a vehicle by id",
    description:
      "This endpoint search and complete the vehicle information by information of the vehicle in RUNT",
  })
  @ApiOkResponse(GetVehicleByIdResponse)
  @Get(":id")
  private async findOne(@Param("id") id: number) {
    return await this.vehicleService.findOne(Number(id));
  }

  @ApiOperation({
    summary: "Update a vehicle by id",
  })
  @ApiOkResponse(UpdateVehicleSuccessResponse)
  @Patch(":id")
  private async update(
    @Param("id") id: number,
    @Body(new ZodValidationPipe(UpdateVehicleSchema))
    updateuserDto: UpdateVehicleDto,
  ) {
    return await this.vehicleService.update(Number(id), updateuserDto);
  }

  @ApiOperation({
    summary: "Delete a vehicle by id",
  })
  @Delete(":id")
  private async remove(@Param("id") id: number, @User() user: IUser) {
    return await this.vehicleService.remove(Number(id), user);
  }

  @ApiOperation({
    summary: "Historical of a vehicle, query by runt (plate)",
  })
  @ApiOkResponse(GetVehicleHistoryResponse)
  @Get(":plate/history")
  private async getVehicleHistory(@Param("plate") plate: string) {
    return await this.vehicleService.getVehicleHistory(plate);
  }

  @ApiOperation({
    summary: "Accidents of a vehicle, query by runt (plate)",
  })
  @ApiOkResponse(GetVehicleAccidentsResponse)
  @Get(":plate/accidents")
  private async getVehicleAccidents(@Param("plate") plate: string) {
    return await this.vehicleService.getVehicleAccidents(plate);
  }

  @ApiOperation({
    summary: "Precautionary measures of a vehicle, query by runt (plate)",
  })
  @ApiOkResponse(GetVehiclePrecautionaryMeasuresResponse)
  @Get(":plate/precautionary-measures")
  private async getVehiclePrecautionaryMeasures(@Param("plate") plate: string) {
    return await this.vehicleService.getVehiclePrecautionaryMeasures(plate);
  }

  @ApiOperation({
    summary: "Transfer history of a vehicle, query by runt (plate)",
  })
  @ApiOkResponse(GetVehicleTransferHistoryResponse)
  @Get(":plate/transfer-history")
  private async getVehicleTransferHistory(@Param("plate") plate: string) {
    return await this.vehicleService.getVehicleTransferHistory(plate);
  }
}
