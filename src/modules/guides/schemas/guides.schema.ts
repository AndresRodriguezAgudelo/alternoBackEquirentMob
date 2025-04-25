import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
} from "class-validator";
import { z } from "zod";

class CreateGuideDto {
  @IsNotEmpty({ message: "El nombre es obligatorio." })
  @IsString({ message: "El nombre debe ser una cadena de texto." })
  name: string;

  @IsOptional()
  @IsNumberString({}, { message: "El ID de la categoría debe ser un número." })
  categoryId?: number;

  @IsNotEmpty({ message: "La descripción es obligatoria." })
  @IsString({ message: "La descripción debe ser una cadena de texto." })
  description: string;

  file: any;
  fileSecondary: any;
  fileTertiary: any;
}

class UpdateGuideDto {
  @IsOptional()
  @IsString({ message: "El nombre debe ser una cadena de texto." })
  name?: string;

  @IsOptional()
  @IsNumberString({}, { message: "El ID de la categoría debe ser un número." })
  categoryId?: number;

  @IsOptional()
  @IsString({ message: "La descripción debe ser una cadena de texto." })
  description?: string;

  file?: any;
  fileSecondary?: any;
  fileTertiary?: any;
}

const CreateGuideSchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .min(1, "El nombre es obligatorio."),
  categoryId: z.string().regex(/^\d+$/).optional(),
  description: z
    .string({ required_error: "La descripción es obligatoria" })
    .min(1, "La descripción es obligatoria."),
  file: z.string().optional(),
  fileSecondary: z.string().optional(),
  fileTertiary: z.string().optional(),
});

const UpdateGuideSchema = z.object({
  name: z.string().optional(),
  categoryId: z.string().regex(/^\d+$/).optional(),
  description: z.string().optional(),
  file: z.string().optional(),
  fileSecondary: z.string().optional(),
  fileTertiary: z.string().optional(),
});

export { CreateGuideDto, UpdateGuideDto, CreateGuideSchema, UpdateGuideSchema };
