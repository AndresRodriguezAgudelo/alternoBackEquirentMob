import { Controller, Get, Param, Res } from "@nestjs/common";
import { FilesService } from "../services/files.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { GetFileApiResponse } from "../docs/files.docs";
@ApiTags("Files")
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({
    summary: "Get a file",
  })
  @ApiOkResponse(GetFileApiResponse)
  @Get("file/:folderName/:id")
  async getPublicFile(
    @Param("id") id: string,
    @Res() res: Response,
    @Param("folderName") folderName: string,
  ) {
    return await this.filesService.getPublicFile(folderName, id, res);
  }
}
