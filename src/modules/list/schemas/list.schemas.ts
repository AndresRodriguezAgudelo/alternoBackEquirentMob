import {
  IsArray,
  IsInt,
  ArrayNotEmpty,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

class UpdateListOrderDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: "Array de IDs de las órdenes que se quieren actualizar.",
    type: [Number],
  })
  @IsArray({ message: "orderIds debe ser un array de números." })
  @ArrayNotEmpty({ message: "El array orderIds no puede estar vacío." })
  @ValidateNested({ each: true })
  @Type(() => Number)
  @IsInt({
    each: true,
    message: "Cada elemento de orderIds debe ser un número entero.",
  })
  @Min(1, {
    each: true,
    message: "Cada número en orderIds debe ser mayor o igual a 1.",
  })
  orderIds: number[];
}

const UpdateListOrderSchema = z.object({
  orderIds: z
    .array(
      z.number({ invalid_type_error: "Cada ID debe ser un número entero." }),
    )
    .nonempty({ message: "El array orderIds no puede estar vacío." })
    .min(1, { message: "Debe haber al menos un ID en el array." })
    .refine((ids) => ids.every((id) => Number.isInteger(id) && id >= 1), {
      message: "Cada ID debe ser un número entero mayor o igual a 1.",
    }),
});

export { UpdateListOrderDto, UpdateListOrderSchema };
