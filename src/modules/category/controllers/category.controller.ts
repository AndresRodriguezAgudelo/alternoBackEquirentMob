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
import { CategoryService } from "../services/category.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CreateCategoryApiResponse,
  GetAllCategorysApiResponse,
  GetOneCategoryApiResponse,
  UpdateCategoryApiResponse,
} from "../docs/category.doc";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreateCategoryDto,
  CreateCategorySchema,
  UpdateCategoryDto,
  UpdateCategorySchema,
} from "../schemas/category.schema";
import { PageOptionsDto } from "@/common";

@ApiTags("Category")
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({
    summary: "Create a new category",
  })
  @ApiOkResponse(CreateCategoryApiResponse)
  @Post()
  private async create(
    @Body(new ZodValidationPipe(CreateCategorySchema))
    createcategoryDto: CreateCategoryDto,
  ) {
    return await this.categoryService.create(createcategoryDto);
  }

  @ApiOperation({
    summary: "Get all category types paginated",
  })
  @ApiOkResponse(GetAllCategorysApiResponse)
  @Get()
  private async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.categoryService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: "Get a category by id",
  })
  @ApiOkResponse(GetOneCategoryApiResponse)
  @Get(":id")
  private async findOne(@Param("id") id: number) {
    return await this.categoryService.findOne(Number(id));
  }

  @ApiOperation({
    summary: "Update a category by id",
  })
  @ApiOkResponse(UpdateCategoryApiResponse)
  @Patch(":id")
  private async update(
    @Param("id") id: number,
    @Body(new ZodValidationPipe(UpdateCategorySchema))
    updatecategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(Number(id), updatecategoryDto);
  }

  @ApiOperation({
    summary: "Delete a category by id",
  })
  @Delete(":id")
  private async remove(@Param("id") id: number) {
    return await this.categoryService.remove(Number(id));
  }
}
