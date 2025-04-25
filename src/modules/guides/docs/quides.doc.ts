import { ApiResponseOptions } from "@nestjs/swagger";

const CreateGuideApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Guía creada correctamente",
  schema: {
    example: {
      name: "Example name",
      description: "Example description",
      keyMain: "guide/Example name-1739913129198.webp",
      keySecondary: "guide/Example name_secondary-1739913130047.webp",
      keyTertiaryVideo: "",
      categoryId: "1",
      id: 1,
      createdAt: "2025-02-19T02:12:11.430Z",
      updatedAt: "2025-02-19T02:12:11.430Z",
      deletedAt: null,
    },
  },
};

const CreateGuideErrorApiResponse: ApiResponseOptions = {
  status: 400,
  description: "Error al crear la guía - Imagen principal requerida",
  schema: {
    example: {
      message: "Imagen principal requerida",
      method: "POST",
      body: '{"description":"Example description","name":"Example name"}',
      params: "{}",
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-18T21:13:35.706Z",
      path: "/api/sign/v1/guides",
      errors: null,
    },
  },
};

const GetAllGuidesApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Listado de guías obtenido correctamente",
  schema: {
    example: {
      data: [
        {
          id: 1,
          name: "Example name",
          categoryId: 1,
          keyMain: "guide/Example name-1739913129198.webp",
          keySecondary: "guide/Example name_secondary-1739913130047.webp",
          keyTertiaryVideo: "",
          description: "Example description",
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

const GetGuideApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Guía obtenida correctamente",
  schema: {
    example: {
      id: 1,
      createdAt: "2025-02-19T02:12:11.430Z",
      updatedAt: "2025-02-19T02:12:11.430Z",
      deletedAt: null,
      name: "Example name",
      categoryId: 1,
      keyMain: "guide/Example name-1739913129198.webp",
      keySecondary: "guide/Example name_secondary-1739913130047.webp",
      keyTertiaryVideo: "",
      description: "Example description",
    },
  },
};

const GetGuideErrorApiResponse: ApiResponseOptions = {
  status: 404,
  description: "Guía no encontrada",
  schema: {
    example: {
      message: "Guía no encontrada",
      method: "GET",
      body: "{}",
      params: '{"id":"12"}',
      currentMicroservice: "equisoft-backend-app",
      status: 404,
      timestamp: "2025-02-18T21:17:27.677Z",
      path: "/api/sign/v1/guides/12",
      errors: null,
    },
  },
};

const UpdateGuideApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Guía actualizada correctamente",
  schema: {
    example: "Guía actualizada correctamente",
  },
};

const UpdateGuideErrorApiResponse: ApiResponseOptions = {
  status: 404,
  description: "Error al actualizar - Guía no encontrada",
  schema: {
    example: {
      message: "Guía no encontrada",
      method: "PATCH",
      body: '{"description":"Example description","link":"https://example.com","name":"Example name"}',
      params: '{"id":"12"}',
      currentMicroservice: "equisoft-backend-app",
      status: 404,
      timestamp: "2025-02-18T21:18:00.666Z",
      path: "/api/sign/v1/guides/12",
      errors: null,
    },
  },
};

export {
  CreateGuideApiResponse,
  CreateGuideErrorApiResponse,
  GetAllGuidesApiResponse,
  GetGuideApiResponse,
  GetGuideErrorApiResponse,
  UpdateGuideApiResponse,
  UpdateGuideErrorApiResponse,
};
