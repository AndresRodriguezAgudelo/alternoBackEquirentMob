import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";
import { z } from "zod";

class CreateInsurerDto {
  @ApiProperty({
    example: "CC",
    description: "Nombre de la Aseguradora, con un máximo de 100 caracteres.",
  })
  @IsString({
    message: "El nombre de la Aseguradora debe ser una cadena de texto.",
  })
  @MinLength(2, {
    message: "El nombre de la Aseguradora debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message: "El nombre de la Aseguradora no puede superar los 100 caracteres.",
  })
  nameInsurer: string;
}

class UpdateInsurerDto {
  @ApiPropertyOptional({
    example: "Sura",
    description: "Nombre actualizado de la Aseguradora.",
  })
  @IsString({
    message: "El nombre de la Aseguradora debe ser una cadena de texto.",
  })
  @MinLength(2, {
    message: "El nombre de la Aseguradora debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message: "El nombre de la Aseguradora no puede superar los 100 caracteres.",
  })
  nameInsurer?: string;
}

const InsurerSchema = z.object({
  nameInsurer: z
    .string()
    .min(2, {
      message: "El nombre de la Aseguradora debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message:
        "El nombre de la Aseguradora no puede superar los 100 caracteres.",
    }),
});

const CreateInsurerSchema = InsurerSchema.pick({
  nameInsurer: true,
});

const UpdateInsurerSchema = InsurerSchema.partial();

export {
  CreateInsurerDto,
  UpdateInsurerDto,
  CreateInsurerSchema,
  UpdateInsurerSchema,
};
