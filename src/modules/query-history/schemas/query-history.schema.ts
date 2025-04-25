import { PageOptionsDto } from "@/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

class FiltersQueryHistoryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: "Filtro por fecha de inicio",
    example: "2021-01-01",
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Filtro por fecha de fin",
    example: "2021-12-31",
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

export { FiltersQueryHistoryDto };
