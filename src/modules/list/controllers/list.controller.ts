import { Body, Controller, Put } from "@nestjs/common";
import { ListService } from "../services/list.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import {
  UpdateListOrderDto,
  UpdateListOrderSchema,
} from "../schemas/list.schemas";
import { Auth } from "@/common/decorators/auth.decorators";

@Auth()
@ApiTags("List")
@Controller("list")
export class ListController {
  constructor(private readonly listService: ListService) {}

  @ApiOperation({
    summary: "Update a order list",
  })
  @ApiOkResponse()
  @Put()
  private async update(
    @Body(new ZodValidationPipe(UpdateListOrderSchema))
    updateListOrderSchema: UpdateListOrderDto,
  ) {
    return await this.listService.upsertListOrder(updateListOrderSchema);
  }
}
