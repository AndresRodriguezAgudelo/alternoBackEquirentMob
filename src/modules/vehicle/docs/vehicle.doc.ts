import { ApiResponseOptions } from "@nestjs/swagger";

const CreateVehicleSuccessResponse: ApiResponseOptions = {
  status: 201,
  description: "Vehículo creado exitosamente",
  schema: {
    example: {
      licensePlate: "ABC123",
      numberDocument: "123456789",
      typeDocumentId: 1,
      model: null,
      age: null,
      class: null,
      service: null,
      fuel: null,
      color: null,
      vin: null,
      serial: null,
      numberEngine: null,
      capacityEngine: null,
      numberRegister: null,
      dateRegister: null,
      cityRegisterId: null,
      organismTransit: null,
      id: 3,
      createdAt: "2025-02-11T06:52:09.180Z",
      updatedAt: "2025-02-11T06:52:09.180Z",
      deletedAt: null,
    },
  },
};
const CreateVehicleBadRequestResponse: ApiResponseOptions = {
  status: 400,
  description:
    "Error de validación al crear el vehículo (duplicado o datos incorrectos)",
  schema: {
    example: {
      message: "El vehículo ya existe",
      method: "POST",
      body: '{"licensePlate":"ABC123","numberDocument":"123456789","typeDocumentId":12}',
      params: "{}",
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-11T01:53:05.837Z",
      path: "/api/sign/v1/vehicle",
      errors: null,
    },
  },
};
const GetAllVehiclesResponse: ApiResponseOptions = {
  status: 200,
  description: "Lista de vehículos paginada",
  schema: {
    example: {
      data: [
        {
          id: 3,
          licensePlate: "ABC123",
          model: null,
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
const GetVehicleByIdResponse: ApiResponseOptions = {
  status: 200,
  description: "Detalles de un vehículo específico",
  schema: {
    example: {
      id: 3,
      createdAt: "2025-02-11T06:52:09.180Z",
      updatedAt: "2025-02-11T06:52:09.180Z",
      deletedAt: "No disponible",
      licensePlate: "CFG654",
      numberDocument: "123456789",
      typeDocumentId: 1,
      model: "No disponible",
      age: "No disponible",
      brand: "No disponible",
      line: "No disponible",
      class: "No disponible",
      service: "No disponible",
      fuel: "No disponible",
      color: "No disponible",
      passagers: "No disponible",
      vin: "No disponible",
      serial: "No disponible",
      numberEngine: "No disponible",
      capacityEngine: "No disponible",
      numberRegister: "No disponible",
      dateRegister: "No disponible",
      cityRegisterName: "No disponible",
      organismTransit: "No disponible",
    },
  },
};

const UpdateVehicleSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: "Vehículo actualizado correctamente",
  schema: {
    example: "Vehículo actualizado correctamente",
  },
};

const GetVehicleAccidentsResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene la información de accidentes del vehículo",
  schema: {
    example: {
      ultimateUpdate: "2025-03-19T02:57:21.666Z",
      accidents: {
        totalAccidents: 0,
        cityLastAccident: "BOGOTA",
        accidentIndicator: 0,
        daysSinceLastAccident: 1470,
      },
    },
  },
};

const GetVehicleTransferHistoryResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene la información de historial de traspaso del vehículo",
  schema: {
    example: {
      ultimateUpdate: "2025-03-19T02:57:21.666Z",
      transferHistory: {
        pledge: false,
        precautionaryMeasures: false,
        taxes: false,
        soatActive: false,
        rtmStatus: false,
      },
    },
  },
};

const GetVehicleHistoryResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene la información histórica del vehículo",
  schema: {
    example: {
      ultimateUpdate: "2025-03-19T02:57:21.666Z",
      history: [
        {
          recordId: 1,
          date: "2024-08-10T00:00:00.000Z",
          requestType: "RTM",
          status: "APROBADA",
          entity: "BOGOTA",
        },
        {
          recordId: 3,
          date: "No disponible",
          requestType: "Transpaso",
          status: "No disponible",
          entity: "No disponible",
        },
      ],
    },
  },
};

const GetVehiclePrecautionaryMeasuresResponse: ApiResponseOptions = {
  status: 200,
  description:
    "Obtiene la información de medidas cautelares del vehículo (en inglés)",
  schema: {
    example: {
      ultimateUpdate: "2025-03-19T02:57:21.666Z",
      precautionaryMeasures: {
        embargo: false,
        impound: false,
        kidnapping: false,
        reportedTheft: false,
        fatalAccident: false,
        openTransfer: false,
      },
    },
  },
};
export {
  CreateVehicleSuccessResponse,
  CreateVehicleBadRequestResponse,
  GetAllVehiclesResponse,
  GetVehicleByIdResponse,
  UpdateVehicleSuccessResponse,
  GetVehicleAccidentsResponse,
  GetVehicleTransferHistoryResponse,
  GetVehicleHistoryResponse,
  GetVehiclePrecautionaryMeasuresResponse,
};
