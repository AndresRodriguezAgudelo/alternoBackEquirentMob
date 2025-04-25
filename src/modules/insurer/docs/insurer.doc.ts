import { ApiResponseOptions } from "@nestjs/swagger";

const CreateInsurerApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Aseguradora creada correctamente",
  schema: {
    example: {
      nameInsurer: "Sura",
      id: 1,
      createdAt: "2025-01-08T02:38:42.073Z",
      updatedAt: "2025-01-08T02:38:42.073Z",
      deletedAt: null,
    },
  },
};

const GetAllInsurersApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Listado de Asuguradoras",
  schema: {
    example: {
      data: [
        {
          id: 1,
          nameInsurer: "Sura",
        },
      ],
      meta: {
        page: "1",
        take: "10",
        total: 1,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
  },
};

const GetOneInsurerApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Información de una aseguradora",
  schema: {
    example: {
      id: 1,
      createdAt: "2025-01-08T02:38:42.073Z",
      updatedAt: "2025-01-08T02:38:42.073Z",
      deletedAt: null,
      nameInsurer: "CC",
    },
  },
};

const UpdateInsurerApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Aseguradora actualizada correctamente",
};

export {
  CreateInsurerApiResponse,
  GetAllInsurersApiResponse,
  GetOneInsurerApiResponse,
  UpdateInsurerApiResponse,
};
