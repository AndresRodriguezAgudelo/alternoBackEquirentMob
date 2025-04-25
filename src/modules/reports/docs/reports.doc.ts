import { ApiResponseOptions } from "@nestjs/swagger";

const ExcelFileResponse: ApiResponseOptions = {
  description: "Download file",
  content: {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      schema: {
        type: "string",
        format: "binary",
      },
    },
  },
};

const ModuleBadRequestResponse: ApiResponseOptions = {
  description: "El módulo no es válido",
  schema: {
    example: {
      message: "El módulo no es válido",
    },
  },
};

export { ExcelFileResponse, ModuleBadRequestResponse };
