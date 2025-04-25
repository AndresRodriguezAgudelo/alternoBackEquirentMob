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
import { CityService } from "../services/city.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CreateCityApiResponse,
  GetAllCitysApiResponse,
  GetOneCityApiResponse,
  UpdateCityApiResponse,
} from "../docs/city.doc";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateCityDto,
  CreateCitySchema,
  UpdateCityDto,
  UpdateCitySchema,
} from "../schemas/city.schema";
import { PageOptionsDto } from "@/common";
import { Auth } from "@/common/decorators/auth.decorators";

@ApiTags("City")
@Controller("city")
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Auth()
  @ApiOperation({
    summary: "Create a new city",
  })
  @ApiOkResponse(CreateCityApiResponse)
  @Post()
  private async create(
    @Body(new ZodValidationPipe(CreateCitySchema)) createCityDto: CreateCityDto,
  ) {
    return await this.cityService.create(createCityDto);
  }

  @ApiOperation({
    summary: "Get all cities paginated",
  })
  @ApiOkResponse(GetAllCitysApiResponse)
  @Get()
  private async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.cityService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: "Get a city by id",
  })
  @ApiOkResponse(GetOneCityApiResponse)
  @Get(":id")
  private async findOne(@Param("id") id: number) {
    return await this.cityService.findOne(Number(id));
  }

  @Auth()
  @ApiOperation({
    summary: "Update a city by id",
  })
  @ApiOkResponse(UpdateCityApiResponse)
  @Patch(":id")
  private async update(
    @Param("id") id: number,
    @Body(new ZodValidationPipe(UpdateCitySchema)) updateCityDto: UpdateCityDto,
  ) {
    return await this.cityService.update(Number(id), updateCityDto);
  }

  @Auth()
  @ApiOperation({
    summary: "Delete a city by id",
  })
  @Delete(":id")
  private async remove(@Param("id") id: number) {
    return await this.cityService.remove(Number(id));
  }
}
