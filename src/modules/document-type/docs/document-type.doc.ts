import { ApiResponseOptions } from "@nestjs/swagger";

const CreateDocumentApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Tipo de documento creado correctamente",
  schema: {
    example: {
      typeName: "CC",
      id: 1,
      createdAt: "2025-01-08T02:38:42.073Z",
      updatedAt: "2025-01-08T02:38:42.073Z",
      deletedAt: null,
    },
  },
};

const GetAllDocumentsApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Listado de tipos de documentos",
  schema: {
    example: {
      data: [
        {
          id: 1,
          typeName: "CC",
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

const GetOneDocumentApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Información de un tipo de documento",
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

const UpdateDocumentApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Tipo de documento actualizado correctamente",
};

export {
  CreateDocumentApiResponse,
  GetAllDocumentsApiResponse,
  GetOneDocumentApiResponse,
  UpdateDocumentApiResponse,
};
