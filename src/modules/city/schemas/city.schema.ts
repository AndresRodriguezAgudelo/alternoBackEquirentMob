import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";
import { z } from "zod";

class CreateCityDto {
  @ApiProperty({
    example: "Madrid",
    description: "Nombre de la ciudad, con un máximo de 100 caracteres.",
  })
  @IsString({ message: "El nombre de la ciudad debe ser una cadena de texto." })
  @MinLength(2, {
    message: "El nombre de la ciudad debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message: "El nombre de la ciudad no puede superar los 100 caracteres.",
  })
  cityName: string;
}

class UpdateCityDto {
  @ApiPropertyOptional({
    example: "Barcelona",
    description: "Nombre actualizado de la ciudad.",
  })
  @IsString({ message: "El nombre de la ciudad debe ser una cadena de texto." })
  @MinLength(2, {
    message: "El nombre de la ciudad debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message: "El nombre de la ciudad no puede superar los 100 caracteres.",
  })
  cityName?: string;
}

const CitySchema = z.object({
  cityName: z
    .string()
    .min(2, {
      message: "El nombre de la ciudad debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message: "El nombre de la ciudad no puede superar los 100 caracteres.",
    }),
});

const CreateCitySchema = CitySchema.pick({
  cityName: true,
});

const UpdateCitySchema = CitySchema.partial();

export { CreateCityDto, UpdateCityDto, CreateCitySchema, UpdateCitySchema };
