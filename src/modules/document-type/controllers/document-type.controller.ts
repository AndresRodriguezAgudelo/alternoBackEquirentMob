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
import { DocumentTypeService } from "../services/document-type.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateDocumentApiResponse,
  GetAllDocumentsApiResponse,
  GetOneDocumentApiResponse,
  UpdateDocumentApiResponse,
} from "../docs/document-type.doc";
import {
  CreateDocumentDto,
  CreateDocumentSchema,
  UpdateDocumentDto,
  UpdateDocumentSchema,
} from "../schemas/document-type.schema";
import { PageOptionsDto } from "@/common";
import { Auth } from "@/common/decorators/auth.decorators";
@ApiTags("Document Type")
@Controller("document-type")
export class DocumentTypeController {
  constructor(private readonly documentService: DocumentTypeService) {}

  @ApiOperation({
    summary: "Create a new document",
  })
  @Auth()
  @ApiOkResponse(CreateDocumentApiResponse)
  @Post()
  private async create(
    @Body(new ZodValidationPipe(CreateDocumentSchema))
    createdocumentDto: CreateDocumentDto,
  ) {
    return await this.documentService.create(createdocumentDto);
  }

  @ApiOperation({
    summary: "Get all document types paginated",
  })
  @ApiOkResponse(GetAllDocumentsApiResponse)
  @Get()
  private async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.documentService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: "Get a document by id",
  })
  @ApiOkResponse(GetOneDocumentApiResponse)
  @Get(":id")
  private async findOne(@Param("id") id: number) {
    return await this.documentService.findOne(Number(id));
  }

  @ApiOperation({
    summary: "Update a document by id",
  })
  @Auth()
  @ApiOkResponse(UpdateDocumentApiResponse)
  @Patch(":id")
  private async update(
    @Param("id") id: number,
    @Body(new ZodValidationPipe(UpdateDocumentSchema))
    updatedocumentDto: UpdateDocumentDto,
  ) {
    return await this.documentService.update(Number(id), updatedocumentDto);
  }

  @ApiOperation({
    summary: "Delete a document by id",
  })
  @Auth()
  @Delete(":id")
  private async remove(@Param("id") id: number) {
    return await this.documentService.remove(Number(id));
  }
}
