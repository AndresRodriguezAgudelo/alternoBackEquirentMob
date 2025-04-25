import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import { z } from "zod";

const CreateServicingSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  link: z
    .string()
    .url("El enlace debe ser una URL válida")
    .min(1, "El enlace no puede estar vacío")
    .max(100, "El enlace no puede tener más de 100 caracteres"),
  description: z
    .string()
    .min(1, "La descripción no puede estar vacía")
    .max(100, "La descripción no puede tener más de 100 caracteres"),
});

const UpdateServicingSchema = z.object({
  name: z.string().optional(),
  link: z.string().url("El enlace debe ser una URL válida").optional(),
  description: z.string().optional(),
  file: z.string().optional(),
});

class CreateServicingDto {
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  name: string;

  @IsNotEmpty({ message: "El enlace es requerido" })
  @IsString({ message: "El enlace debe ser una cadena de texto" })
  @IsUrl({}, { message: "El enlace debe ser una URL válida" })
  link: string;

  @IsNotEmpty({ message: "La descripción es requerida" })
  @IsString({ message: "La descripción debe ser una cadena de texto" })
  description: string;

  file: any;
}

class UpdateServicingDto {
  @IsOptional()
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  name?: string;

  @IsOptional()
  @IsString({ message: "El enlace debe ser una cadena de texto" })
  @IsUrl({}, { message: "El enlace debe ser una URL válida" })
  link?: string;

  @IsOptional()
  @IsString({ message: "La descripción debe ser una cadena de texto" })
  description?: string;

  @IsOptional()
  file?: string;
}

export {
  CreateServicingSchema,
  UpdateServicingSchema,
  CreateServicingDto,
  UpdateServicingDto,
};
