import { ApiResponseOptions } from "@nestjs/swagger";

const GetLogsApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Logs obtenidos correctamente",
  schema: {
    example: {
      data: [
        {
          id: 1,
          createdAt: "2025-02-24T05:29:47.106Z",
          module: "fines-simit",
          user: {
            name: "Administrador",
          },
        },
        {
          id: 2,
          createdAt: "2025-02-27T02:03:48.776Z",
          module: "SOAT",
          user: {
            name: "Administrador",
          },
        },
        {
          id: 3,
          createdAt: "2025-02-27T02:03:48.860Z",
          module: "SOAT",
          user: {
            name: "Administrador",
          },
        },
      ],
      meta: {
        page: "1",
        take: "10",
        total: 3,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
  },
};

const GetModulesApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Módulos obtenidos correctamente",
  schema: {
    example: [
      "Registro inicial",
      "RTM",
      "SOAT",
      "LICENCIA DE CONDUCCIÓN",
      "Historial vehicular",
    ],
  },
};

export { GetLogsApiResponse, GetModulesApiResponse };
