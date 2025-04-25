import { ApiResponseOptions } from "@nestjs/swagger";

const CreateCategoryApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Categoria creada correctamente",
  schema: {
    example: {
      typeName: "Incendios",
      id: 1,
      createdAt: "2025-01-08T02:38:42.073Z",
      updatedAt: "2025-01-08T02:38:42.073Z",
      deletedAt: null,
    },
  },
};

const GetAllCategorysApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Listado de categorias",
  schema: {
    example: {
      data: [
        {
          id: 1,
          typeName: "Incendios",
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

const GetOneCategoryApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Información de una Categoria",
  schema: {
    example: {
      id: 1,
      createdAt: "2025-01-08T02:38:42.073Z",
      updatedAt: "2025-01-08T02:38:42.073Z",
      deletedAt: null,
      typeName: "CC",
    },
  },
};

const UpdateCategoryApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Categoria actualizada correctamente",
};

export {
  CreateCategoryApiResponse,
  GetAllCategorysApiResponse,
  GetOneCategoryApiResponse,
  UpdateCategoryApiResponse,
};
