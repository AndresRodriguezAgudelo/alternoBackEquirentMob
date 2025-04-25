import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

enum Order {
  ASC = "ASC",
  DESC = "DESC",
}

class PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  readonly search?: string;

  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order.ASC;

  @ApiProperty({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
   page?: number = 1;

  @ApiProperty({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
   take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}

/* It's an interface that defines the parameters that the PageMetaDto constructor takes. */
interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  total: number;
}

/* It takes a PageOptionsDto and an itemCount and returns a PageMetaDto */
class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, total }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.total = total;
    this.pageCount = Math.ceil(this.total / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

/* It's a class that contains a list of data and a PageMetaDto object */
class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}

export { Order, PageOptionsDto, PageMetaDtoParameters, PageMetaDto, PageDto };
