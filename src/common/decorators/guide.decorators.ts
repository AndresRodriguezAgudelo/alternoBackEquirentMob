import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";

export function UploadGuides() {
  return applyDecorators(
    ApiConsumes("multipart/form-data"),
    UseInterceptors(
      FileFieldsInterceptor([
        { name: "file", maxCount: 1 },
        { name: "fileSecondary", maxCount: 1 },
        { name: "fileTertiary", maxCount: 1 },
      ]),
    ),
    ApiBody({
      description: "Crear una nueva guía",
      schema: {
        type: "object",
        properties: {
          file: { type: "string", format: "binary" },
          fileSecondary: { type: "string", format: "binary" },
          fileTertiary: { type: "string", format: "binary" },
          categoryId: { type: "number", example: 1 },
          description: {
            type: "string",
            example: "Example description",
            maxLength: 100,
          },
          name: { type: "string", example: "Example name", maxLength: 100 },
        },
      },
    }),
  );
}
