import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";

export function UploadService() {
  return applyDecorators(
    ApiConsumes("multipart/form-data"),
    UseInterceptors(FileInterceptor("file")),
    ApiBody({
      description: "Crear un nuevo servicio",
      schema: {
        type: "object",
        properties: {
          file: {
            type: "string",
            format: "binary",
          },
          description: {
            type: "string",
            example: "Example description",
            maxLength: 100,
          },
          link: {
            type: "string",
            example: "https://example.com",
            maxLength: 100,
          },
          name: {
            type: "string",
            example: "Example name",
            maxLength: 100,
          },
        },
      },
    }),
  );
}
