import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsInt,
  MaxLength,
  IsPositive,
  IsDefined,
} from "class-validator";
import { z } from "zod";
class CreateVehicleDto {
  @ApiProperty({
    example: "ABC123",
    description: "Placa del vehículo (máximo 6 caracteres, obligatorio)",
  })
  @IsString({ message: "La placa del vehículo debe ser un texto." })
  @IsNotEmpty({ message: "La placa del vehículo es obligatoria." })
  @MaxLength(6, { message: "La placa no puede exceder los 6 caracteres." })
  licensePlate: string;

  @ApiPropertyOptional({
    example: "123456789",
    description:
      "Número de documento del vehículo (máximo 50 caracteres, obligatorio)",
  })
  @IsString({ message: "El número de documento debe ser un texto." })
  @IsNotEmpty({ message: "El número de documento es obligatorio." })
  @MaxLength(50, {
    message: "El número de documento no puede exceder los 50 caracteres.",
  })
  numberDocument: string;

  @ApiProperty({
    example: 1,
    description: "ID del tipo de documento (entero positivo obligatorio)",
  })
  @IsInt({ message: "El ID del tipo de documento debe ser un número entero." })
  @IsPositive({ message: "El ID del tipo de documento debe ser positivo." })
  @IsDefined({ message: "El ID del tipo de documento es obligatorio." })
  typeDocumentId: number;
}

class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}

const CreateVehicleSchema = z.object({
  licensePlate: z
    .string()
    .min(1, { message: "La placa del vehículo es obligatoria." })
    .max(6, { message: "La placa no puede exceder los 6 caracteres." })
    .describe("Placa del vehículo (obligatorio, máximo 6 caracteres)"),

  numberDocument: z
    .string()
    .min(1, { message: "El número de documento es obligatorio." })
    .max(50, {
      message: "El número de documento no puede exceder los 50 caracteres.",
    })
    .describe(
      "Número de documento del vehículo (obligatorio, máximo 50 caracteres)",
    ),

  typeDocumentId: z
    .number()
    .int({ message: "El ID del tipo de documento debe ser un número entero." })
    .positive({ message: "El ID del tipo de documento debe ser positivo." })
    .describe("ID del tipo de documento (obligatorio, entero positivo)"),
});

const UpdateVehicleSchema = CreateVehicleSchema.partial();

type CreateVehicleSchema = z.infer<typeof CreateVehicleSchema>;
type UpdateVehicleSchema = z.infer<typeof UpdateVehicleSchema>;

export {
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateVehicleSchema,
  UpdateVehicleSchema,
};
