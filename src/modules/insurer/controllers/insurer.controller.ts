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
import { InsurerService } from "../services/insurer.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CreateInsurerApiResponse,
  GetAllInsurersApiResponse,
  GetOneInsurerApiResponse,
  UpdateInsurerApiResponse,
} from "../docs/insurer.doc";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateInsurerDto,
  CreateInsurerSchema,
  UpdateInsurerDto,
  UpdateInsurerSchema,
} from "../schemas/insurer.schema";
import { PageOptionsDto } from "@/common";
import { Auth } from "@/common/decorators/auth.decorators";

@ApiTags("Insurer")
@Auth()
@Controller("insurer")
export class InsurerController {
  constructor(private readonly insurerService: InsurerService) {}

  @ApiOperation({
    summary: "Create a new insurer",
  })
  @ApiOkResponse(CreateInsurerApiResponse)
  @Post()
  private async create(
    @Body(new ZodValidationPipe(CreateInsurerSchema))
    createinsurerDto: CreateInsurerDto,
  ) {
    return await this.insurerService.create(createinsurerDto);
  }

  @ApiOperation({
    summary: "Get all insurers paginated",
  })
  @ApiOkResponse(GetAllInsurersApiResponse)
  @Get()
  private async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.insurerService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: "Get a insurer by id",
  })
  @ApiOkResponse(GetOneInsurerApiResponse)
  @Get(":id")
  private async findOne(@Param("id") id: number) {
    return await this.insurerService.findOne(Number(id));
  }

  @ApiOperation({
    summary: "Update a insurer by id",
  })
  @ApiOkResponse(UpdateInsurerApiResponse)
  @Patch(":id")
  private async update(
    @Param("id") id: number,
    @Body(new ZodValidationPipe(UpdateInsurerSchema))
    updateInsurerDto: UpdateInsurerDto,
  ) {
    return await this.insurerService.update(Number(id), updateInsurerDto);
  }

  @ApiOperation({
    summary: "Delete a document by id",
  })
  @Delete(":id")
  private async remove(@Param("id") id: number) {
    return await this.insurerService.remove(Number(id));
  }
}
