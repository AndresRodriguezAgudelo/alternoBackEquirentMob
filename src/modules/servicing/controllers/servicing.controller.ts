import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from "@nestjs/common";
import { ServicingService } from "../services/servicing.service";
import { UploadService } from "@/common/decorators/service.decorator";
import {
  CreateServicingDto,
  CreateServicingSchema,
  UpdateServicingDto,
  UpdateServicingSchema,
} from "../schemas/servicing.schema";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { PageOptionsDto, PageDto } from "@/common";
import { Servicing } from "../entities/servicing.entity";
import { FileDto } from "@/modules/files/schemas/files.schema";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateServicingApiResponse,
  GetAllServicingApiResponse,
  GetOneServicingApiResponse,
  UpdateServicingApiResponse,
} from "../docs/servicing.doc";
import { Auth } from "@/common/decorators/auth.decorators";

@Auth()
@ApiTags("Servicing")
@Controller("servicing")
export class ServicingController {
  constructor(private readonly servicingService: ServicingService) {}

  @Post("")
  @UploadService()
  @ApiOkResponse(CreateServicingApiResponse)
  async create(
    @UploadedFile() file: FileDto,
    @Body(new ZodValidationPipe(CreateServicingSchema))
    body: CreateServicingDto,
  ) {
    return await this.servicingService.create(body, file);
  }

  @ApiOkResponse(GetAllServicingApiResponse)
  @Get("")
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Servicing>> {
    return await this.servicingService.findAll(pageOptionsDto);
  }

  @ApiOkResponse(GetOneServicingApiResponse)
  @Get(":id")
  async findOne(@Param("id") id: number): Promise<Servicing> {
    return await this.servicingService.findOne(id);
  }

  @Patch(":id")
  @UploadService()
  @ApiOkResponse(UpdateServicingApiResponse)
  async update(
    @Param("id") id: number,
    @UploadedFile() file: FileDto,
    @Body(new ZodValidationPipe(UpdateServicingSchema))
    body: UpdateServicingDto,
  ) {
    return await this.servicingService.update(id, body, file);
  }

  @Delete(":id")
  async remove(@Param("id") id: number) {
    return await this.servicingService.remove(id);
  }
}
