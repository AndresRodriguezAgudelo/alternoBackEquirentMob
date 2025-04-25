import { Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { QueryHistoryService } from "../services/query-history.service";
import { FiltersQueryHistoryDto } from "../schemas/query-history.schema";
import { IUser } from "@/interfaces/user.interface";
import { User } from "@/common/decorators/user.decorators";
import { Auth } from "@/common/decorators/auth.decorators";
import {
  GetLogsApiResponse,
  GetModulesApiResponse,
} from "../docs/query-history.doc";
@ApiTags("Query History")
@Auth()
@Controller("query-history")
export class QueryHistoryController {
  constructor(private readonly queryHistoryService: QueryHistoryService) {}

  @ApiOperation({
    summary: "Create a new query for click in payment link",
  })
  @ApiOkResponse()
  @Post()
  private async create(@User() user: IUser) {
    return await this.queryHistoryService.logQuery(user.id, "Link de pago");
  }

  @ApiOperation({
    summary: "Get all query history paginated",
  })
  @ApiOkResponse(GetLogsApiResponse)
  @Get()
  private async findAll(@Query() pageOptionsDto: FiltersQueryHistoryDto) {
    return await this.queryHistoryService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: "Get all modules",
  })
  @ApiOkResponse(GetModulesApiResponse)
  @Get("modules")
  private async getModules() {
    return await this.queryHistoryService.getModules();
  }
}
