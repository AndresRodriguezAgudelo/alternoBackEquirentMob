import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";
import { z } from "zod";

class CreateReminderDto {
  @ApiProperty()
  @IsInt()
  days: number;

  @IsInt()
  expirationId?: number;
}

class UpdateReminderDto {
  @ApiProperty()
  @IsInt()
  days: number;

  @IsOptional()
  @ApiProperty()
  id?: number;
}

const CreateReminderSchema = z.object({
  days: z.number().int().min(0, "Los días deben ser un número entero positivo"),
  expirationId: z
    .number()
    .int()
    .min(1, "El ID de la expiración debe ser un número entero positivo")
    .optional(),
});

const UpdateReminderSchema = z.object({
  days: z.number().int().min(0, "Los días deben ser un número entero positivo"),
  id: z
    .number()
    .int()
    .min(1, "El ID del reminder debe ser un número entero positivo")
    .optional(),
});

export {
  CreateReminderDto,
  UpdateReminderDto,
  CreateReminderSchema,
  UpdateReminderSchema,
};
