import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";

export function PhotoFile() {
  return applyDecorators(
    ApiConsumes("multipart/form-data"),
    UseInterceptors(FileInterceptor("file")),
    ApiBody({
      description: "Actualizar foto de perfil",
      schema: {
        type: "object",
        properties: {
          file: {
            type: "string",
            format: "binary",
          },
        },
      },
    }),
  );
}
