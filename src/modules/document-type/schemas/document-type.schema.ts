import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";
import { z } from "zod";

class CreateDocumentDto {
  @ApiProperty({
    example: "CC",
    description:
      "Nombre del tipo de documento, con un máximo de 100 caracteres.",
  })
  @IsString({
    message: "El nombre del tipo de documento debe ser una cadena de texto.",
  })
  @MinLength(2, {
    message:
      "El nombre del tipo de documento debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message:
      "El nombre del tipo de documento no puede superar los 100 caracteres.",
  })
  typeName: string;
}

class UpdateDocumentDto {
  @ApiPropertyOptional({
    example: "Barcelona",
    description: "Nombre actualizado de tipo de documento.",
  })
  @IsString({
    message: "El nombre de tipo de documento debe ser una cadena de texto.",
  })
  @MinLength(2, {
    message: "El nombre de tipo de documento debe tener al menos 2 caracteres.",
  })
  @MaxLength(100, {
    message:
      "El nombre de tipo de documento no puede superar los 100 caracteres.",
  })
  typeName?: string;
}

const DocumentSchema = z.object({
  typeName: z
    .string()
    .min(2, {
      message:
        "El nombre de tipo de documento debe tener al menos 2 caracteres.",
    })
    .max(100, {
      message:
        "El nombre de tipo de documento no puede superar los 100 caracteres.",
    }),
});

const CreateDocumentSchema = DocumentSchema.pick({
  typeName: true,
});

const UpdateDocumentSchema = DocumentSchema.partial();

export {
  CreateDocumentDto,
  UpdateDocumentDto,
  CreateDocumentSchema,
  UpdateDocumentSchema,
};
