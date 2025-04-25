import { ApiResponseOptions } from "@nestjs/swagger";

const CreateServicingApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Servicio creado exitosamente.",
  content: {
    "application/json": {
      schema: {
        example: {
          name: "Example name",
          link: "https://example.com",
          description: "Example description",
          key: "servicing/Example name-1739834255604.webp",
          id: 4,
          createdAt: "2025-02-18T04:17:37.366Z",
          updatedAt: "2025-02-18T04:17:37.366Z",
          deletedAt: null,
        },
      },
    },
  },
};

const GetAllServicingApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Lista de servicios obtenida exitosamente.",
  content: {
    "application/json": {
      schema: {
        example: {
          data: [
            {
              id: 3,
              name: "Example name",
              link: "https://example.com",
              description: "Example description",
              key: "servicing/Example name-1739833721235.webp",
            },
            {
              id: 2,
              name: "Example name",
              link: "https://example.com",
              description: "Example description",
              key: "servicing/Example name-1739833608766.webp",
            },
            {
              id: 1,
              name: "Example name",
              link: "https://example.com",
              description: "Example description",
              key: "servicing/Example name-1739832677775.webp",
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
    },
  },
};

const GetOneServicingApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Servicio obtenido exitosamente.",
  content: {
    "application/json": {
      schema: {
        example: {
          id: 3,
          createdAt: "2025-02-18T04:08:42.133Z",
          updatedAt: "2025-02-18T04:08:42.133Z",
          deletedAt: null,
          name: "Example name",
          link: "https://example.com",
          description: "Example description",
          key: "servicing/Example name-1739833721235.webp",
        },
      },
    },
  },
};

const UpdateServicingApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Servicio actualizado correctamente.",
  content: {
    "application/json": {
      schema: {
        example: "Servicio actualizado correctamente",
      },
    },
  },
};

export {
  CreateServicingApiResponse,
  GetAllServicingApiResponse,
  GetOneServicingApiResponse,
  UpdateServicingApiResponse,
};
