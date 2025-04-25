import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { ReportsService } from "../services/reports.service";
import { Response } from "express";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from "@nestjs/swagger";
import { PageOptionsDto } from "@/common";
import {
  ExcelFileResponse,
  ModuleBadRequestResponse,
} from "../docs/reports.doc";
import { Auth } from "@/common/decorators/auth.decorators";

@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Auth()
  @ApiOperation({
    summary: "Get an Excel report with data from different endpoints",
    description:
      'If module is "users" it will return a report with users data, if module is "payments and querys" it will return a report with payments and queries data',
  })
  @ApiProduces(
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  @ApiOkResponse(ExcelFileResponse)
  @ApiBadRequestResponse(ModuleBadRequestResponse)
  @Get(":module/excel")
  async getExcelReport(
    @Param("module") module: string,
    @Query() pageOptionsDto: PageOptionsDto,
    @Res() res: Response,
  ): Promise<any> {
    return await this.reportsService.getExcelReport(
      module,
      pageOptionsDto,
      res,
    );
  }
}
