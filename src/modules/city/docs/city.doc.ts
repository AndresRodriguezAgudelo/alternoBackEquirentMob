import { ApiResponseOptions } from "@nestjs/swagger";

const CreateCityApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Ciudad creado correctamente",
  schema: {
    example: {
      cityName: "Barranquilla",
      id: 1,
      createdAt: "2025-01-08T02:38:42.073Z",
      updatedAt: "2025-01-08T02:38:42.073Z",
      deletedAt: null,
    },
  },
};

const GetAllCitysApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Listado de Ciudades",
  schema: {
    example: {
      data: [
        {
          id: 1,
          CityName: "Barranquilla",
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

const GetOneCityApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Información de una ciudad",
  schema: {
    example: {
      id: 1,
      createdAt: "2025-01-08T02:38:42.073Z",
      updatedAt: "2025-01-08T02:38:42.073Z",
      deletedAt: null,
      cityName: "Tribals",
    },
  },
};

const UpdateCityApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Ciudad actualizado correctamente",
};

export {
  CreateCityApiResponse,
  GetAllCitysApiResponse,
  GetOneCityApiResponse,
  UpdateCityApiResponse,
};
