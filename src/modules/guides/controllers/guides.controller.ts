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
  UploadedFiles,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { GuidesService } from "../services/guides.service";
import { UploadService } from "@/common/decorators/service.decorator";
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { FileDto, FilesDto } from "@/modules/files/schemas/files.schema";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateGuideDto,
  CreateGuideSchema,
  UpdateGuideDto,
  UpdateGuideSchema,
} from "../schemas/guides.schema";
import { UploadGuides } from "@/common/decorators/guide.decorators";
import { PageDto, PageOptionsDto } from "@/common";
import { Guides } from "../entities/guides.entity";
import {
  CreateGuideApiResponse,
  CreateGuideErrorApiResponse,
  GetAllGuidesApiResponse,
  GetGuideApiResponse,
  GetGuideErrorApiResponse,
  UpdateGuideApiResponse,
  UpdateGuideErrorApiResponse,
} from "../docs/quides.doc";
import { Auth } from "@/common/decorators/auth.decorators";

@Auth()
@ApiTags("Guides")
@Controller("guides")
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Post("")
  @UploadGuides()
  @ApiOkResponse(CreateGuideApiResponse)
  @ApiBadRequestResponse(CreateGuideErrorApiResponse)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @UploadedFiles() files: FilesDto,
    @Body(new ZodValidationPipe(CreateGuideSchema)) body: CreateGuideDto,
  ) {
    return await this.guidesService.create(body, files);
  }

  @ApiOkResponse(GetAllGuidesApiResponse)
  @Get("")
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Guides>> {
    return await this.guidesService.findAll(pageOptionsDto);
  }

  @ApiOkResponse(GetGuideApiResponse)
  @ApiBadRequestResponse(GetGuideErrorApiResponse)
  @Get(":id")
  async findOne(@Param("id") id: number): Promise<Guides> {
    return await this.guidesService.findOne(id);
  }

  @Patch(":id")
  @UploadService()
  @ApiOkResponse(UpdateGuideApiResponse)
  @ApiBadRequestResponse(UpdateGuideErrorApiResponse)
  async update(
    @Param("id") id: number,
    @UploadedFile() file: FileDto,
    @Body(new ZodValidationPipe(UpdateGuideSchema)) body: UpdateGuideDto,
  ) {
    return await this.guidesService.update(id, body, file);
  }

  @Delete(":id")
  async remove(@Param("id") id: number) {
    return await this.guidesService.remove(id);
  }

  @Get("app/all")
  async findAllApp(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Guides>> {
    return await this.guidesService.findAllApp(pageOptionsDto);
  }

  @Get("app/total")
  async total() {
    return await this.guidesService.total();
  }
}
