import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";
import { z } from "zod";

class CreateCategoryDto {
  @ApiProperty({
    example: "Incendios",
    description: "Nombre de la categoria, con un máximo de 100 caracteres.",
  })
  @IsString({
    message: "El nombre de la categoria debe ser una cadena de texto.",
  })
  @MinLength(2, {
    message: "El nombre de la categoria debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message: "El nombre de la categoria no puede superar los 100 caracteres.",
  })
  categoryName: string;
}

class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: "Terror",
    description: "Nombre actualizado de la categoria.",
  })
  @IsString({
    message: "El nombre de la categoria debe ser una cadena de texto.",
  })
  @MinLength(2, {
    message: "El nombre de la categoria debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message: "El nombre de la categoria no puede superar los 100 caracteres.",
  })
  categoryName?: string;
}

const CategorySchema = z.object({
  categoryName: z
    .string()
    .min(2, {
      message: "El nombre de la categoria debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "El nombre de la categoria no puede superar los 100 caracteres.",
    }),
});

const CreateCategorySchema = CategorySchema.pick({
  categoryName: true,
});

const UpdateCategorySchema = CategorySchema.partial();

export {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateCategorySchema,
  UpdateCategorySchema,
};
