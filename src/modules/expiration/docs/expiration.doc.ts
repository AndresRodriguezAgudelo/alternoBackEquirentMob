import { ApiResponseOptions } from "@nestjs/swagger";

const GetOneExpirationResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración específica",
  schema: {
    example: {
      id: 62,
      createdAt: "2025-03-10T10:20:21.126Z",
      updatedAt: "2025-03-10T10:49:23.516Z",
      deletedAt: null,
      expirationDate: "2025-04-10",
      expirationType: "FULL",
      isSpecial: false,
      hasBanner: false,
      vehicleId: 18,
      description: "",
      reminders: [
        {
          id: 8,
          createdAt: "2025-03-10T10:47:02.476Z",
          updatedAt: "2025-03-10T10:47:02.476Z",
          deletedAt: null,
          days: 11,
          expirationId: 62,
        },
        {
          id: 9,
          createdAt: "2025-03-10T10:48:41.910Z",
          updatedAt: "2025-03-10T10:49:24.720Z",
          deletedAt: null,
          days: 1,
          expirationId: 62,
        },
      ],
    },
  },
};

const CreateExpirationResponse: ApiResponseOptions = {
  status: 201,
  description: "Crea una nueva expiración",
  schema: {
    example: {
      id: 63,
      createdAt: "2025-03-11T03:59:54.113Z",
      updatedAt: "2025-03-11T03:59:54.113Z",
      deletedAt: null,
      expirationDate: "2025-03-10",
      expirationType: "AMR",
      isSpecial: false,
      hasBanner: false,
      vehicleId: 18,
      description: "",
      reminders: [],
    },
  },
};

const UpdateExpirationResponse: ApiResponseOptions = {
  status: 200,
  description: "Actualiza una expiración",
  schema: {
    example: {
      id: 62,
      createdAt: "2025-03-10T10:20:21.126Z",
      updatedAt: "2025-03-11T04:10:05.510Z",
      deletedAt: null,
      expirationDate: "2025-04-10",
      expirationType: "OTRA",
      isSpecial: false,
      hasBanner: false,
      vehicleId: 18,
      description: "",
      reminders: [
        {
          id: 8,
          createdAt: "2025-03-10T10:47:02.476Z",
          updatedAt: "2025-03-10T10:47:02.476Z",
          deletedAt: null,
          days: 11,
          expirationId: 62,
        },
        {
          id: 9,
          createdAt: "2025-03-10T10:48:41.910Z",
          updatedAt: "2025-03-10T10:49:24.720Z",
          deletedAt: null,
          days: 1,
          expirationId: 62,
        },
      ],
    },
  },
};

const GetOneExpirationExtintorResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Extintor",
  schema: {
    example: {
      id: 330,
      expirationType: "Extintor",
      expirationDate: null,
      reminders: [],
      isSpecial: false,
      hasBanner: false,
      description:
        "Por ley y seguridad el extintor debe ser recargado cada año, evite sanciones y contratiempos configurando esta alerta.",
      estado: "Configurar",
      updatedAt: "2025-03-19T00:51:34.823Z",
      icon: "fire_extinguisher",
      color: "gray",
    },
  },
};

const GetOneExpirationKitDeCarreteraResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Kit de carretera",
  schema: {
    example: {
      id: 331,
      expirationType: "Kit de carretera",
      expirationDate: null,
      reminders: [],
      isSpecial: false,
      hasBanner: false,
      description:
        "El Kit de Carretera es una medida de precaución que puede marcar la diferencia en una situación de emergencia.  Revíselo periódicamente configurando esta alerta.",
      estado: "Configurar",
      updatedAt: "2025-03-19T00:51:34.830Z",
      icon: "business_center",
      color: "gray",
    },
  },
};

const GetOneExpirationSoatResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo SOAT",
  schema: {
    example: {
      id: 332,
      policyNumber: "No disponible",
      insurer: "No disponible",
      expirationDate: "2025-05-04",
      reminders: [],
      estado: "Vigente",
      imageBanner:
        "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20SOAT.jpg?sp=r&st=2025-03-18T02:04:38Z&se=2026-03-18T10:04:38Z&spr=https&sv=2022-11-02&sr=b&sig=%2BvI5a8M2XU%2FQxF2cw2q%2FGp0JZui9p4kFgO8JRfoHfc0%3D",
      isSpecial: true,
      hasBanner: true,
      updatedAt: "2025-03-19T00:51:38.806Z",
      description:
        "El SOAT además de ser un requisito obligatorio, se encarga de salvaguardar la integridad física de los involucrados en un accidente de tránsito, configure esta alerta y RENUÉVELO con nosotros.",
      icon: "default_icon",
      color: "gray",
      linkBanner: "https://www.google.com/",
    },
  },
};

const GetOneExpirationCambioDeLlantasResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Cambio de llantas",
  schema: {
    example: {
      id: 333,
      expirationType: "Cambio de llantas",
      expirationDate: null,
      reminders: [],
      isSpecial: false,
      hasBanner: true,
      description:
        "Revisiones periódicas prolongan la vida útil de sus neumáticos, mejoran el desempeño del vehículo, y velan por su seguridad. Configure esta alerta y agende su cita de revisión.",
      estado: "Configurar",
      updatedAt: "2025-03-19T00:51:34.833Z",
      icon: "Tire repair",
      color: "gray",
    },
  },
};

const GetOneExpirationRevisionDeFrenosResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Revisión de frenos",
  schema: {
    example: {
      id: 334,
      expirationType: "Revisión de frenos",
      expirationDate: null,
      reminders: [],
      isSpecial: false,
      hasBanner: true,
      description:
        "Revisar frenos periódicamente ayuda a mantener su vehiculo en óptimas condiciones asi como evitar accidentes.  Configure esta alerta y agende su cita de revisión.",
      estado: "Configurar",
      updatedAt: "2025-03-19T00:51:34.833Z",
      icon: "construction",
      color: "gray",
    },
  },
};

const GetOneExpirationCambioDeAceiteResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Cambio de aceite",
  schema: {
    example: {
      id: 335,
      lastMaintenanceDate: "No disponible",
      reminders: [],
      estado: "Configurar",
      expirationDate: "No disponible",
      isSpecial: false,
      hasBanner: true,
      updatedAt: "2025-03-19T00:51:34.836Z",
      imageBanner:
        "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20Aceite.jpg?sp=r&st=2025-03-17T21:23:40Z&se=2026-03-18T05:23:40Z&spr=https&sv=2022-11-02&sr=b&sig=Y9E%2BVFIxiAQ4VSNb86IzyW7ISdvviBRhzs3ByjLZIpg%3D",
      description:
        "El cambio de aceite es clave para prolongar la vida útil de su motor, se recomienda cambiarlo cada 5.000 o 10.000 kilómetros. Revise el último mantenimiento y configure esta alerta.",
      icon: "opacity",
      color: "gray",
    },
  },
};

const GetOneExpirationLicenciaDeConduccionResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Licencia de conducción",
  schema: {
    example: {
      id: 336,
      category: "No disponible",
      service: "Particular",
      expirationDate: null,
      reminders: [],
      estado: "No disponible",
      isSpecial: true,
      hasBanner: false,
      updatedAt: "2025-03-19T00:51:39.853Z",
      description:
        "Renueve su licencia de conducción a tiempo y ?? ¡Evite sanciones! ?? Aplica T&C",
      icon: "default_icon",
      color: "gray",
    },
  },
};

const GetOneExpirationPicoYPlacaResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Pico y placa",
  schema: {
    example: {
      id: 337,
      expirationType: "Pico y placa",
      expirationDate: null,
      reminders: [],
      isSpecial: true,
      hasBanner: false,
      description:
        "Su placa SI puede circular hoy en la ciudad escogida, puede cambiarla según sus preferencias de movilidad. ?? ¡Evite multas! ?? Aplica T&C",
      estado: "Sin multas",
      updatedAt: "2025-03-19T00:51:34.880Z",
      icon: "default_icon",
      color: "green",
    },
  },
};

const GetOneExpirationRTMResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo RTM",
  schema: {
    example: {
      id: 338,
      lastCDA: "No disponible",
      expirationDate: "2025-08-10",
      reminders: [],
      estado: "Vigente",
      isSpecial: true,
      hasBanner: true,
      updatedAt: "2024-08-10",
      description:
        "La RTM es un requisito obligatorio ya que mejora la seguridad vial y reduce el riesgo de siniestros en las carreteras.  Configure esta alerta y agende en su CDA de confianza.",
      imageBanner:
        "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20%20RTM.jpg?sp=r&st=2025-03-18T02:14:41Z&se=2026-03-18T10:14:41Z&spr=https&sv=2022-11-02&sr=b&sig=iFMD6c%2Flxtzm%2BZ5DCo6SDPz1I2GIQapEW%2FoEaRuK4h4%3D",
      icon: "default_icon",
      color: "gray",
      linkBanner: "https://www.google.com/",
    },
  },
};
const GetAllExpirationsResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene todas las expiraciones",
  schema: {
    example: {
      data: [
        {
          id: 329,
          expirationDate: null,
          expirationType: "Póliza todo riesgo",
          isSpecial: false,
          hasBanner: true,
          status: "Configurar",
          percentage: 0,
          icon: "assessment",
          color: "gray",
        },
        {
          id: 330,
          expirationDate: null,
          expirationType: "Extintor",
          isSpecial: false,
          hasBanner: false,
          status: "Configurar",
          percentage: 0,
          icon: "fire_extinguisher",
          color: "gray",
        },
        {
          id: 331,
          expirationDate: null,
          expirationType: "Kit de carretera",
          isSpecial: false,
          hasBanner: false,
          status: "Configurar",
          percentage: 0,
          icon: "business_center",
          color: "gray",
        },
        {
          id: 333,
          expirationDate: null,
          expirationType: "Cambio de llantas",
          isSpecial: false,
          hasBanner: true,
          status: "Configurar",
          percentage: 0,
          icon: "Tire repair",
          color: "gray",
        },
        {
          id: 334,
          expirationDate: null,
          expirationType: "Revisión de frenos",
          isSpecial: false,
          hasBanner: true,
          status: "Configurar",
          percentage: 0,
          icon: "construction",
          color: "gray",
        },
        {
          id: 335,
          expirationDate: null,
          expirationType: "Cambio de aceite",
          isSpecial: false,
          hasBanner: true,
          status: "Configurar",
          percentage: 0,
          icon: "opacity",
          color: "gray",
        },
        {
          id: 336,
          expirationDate: null,
          expirationType: "Licencia de conducción",
          isSpecial: true,
          hasBanner: false,
          status: "No disponible",
          percentage: 0,
          icon: "default_icon",
          color: "red",
        },
        {
          id: 337,
          expirationDate: null,
          expirationType: "Pico y placa",
          isSpecial: true,
          hasBanner: false,
          status: "Configurar",
          percentage: 0,
          icon: "default_icon",
          color: "gray",
        },
        {
          id: 339,
          expirationDate: null,
          expirationType: "Multas",
          isSpecial: true,
          hasBanner: false,
          status: "Sin multas",
          percentage: 0,
          icon: "default_icon",
          color: "green",
        },
        {
          id: 332,
          expirationDate: "2025-05-04",
          expirationType: "SOAT",
          isSpecial: true,
          hasBanner: true,
          status: "Vigente",
          percentage: 46,
          icon: "default_icon",
          color: "green",
        },
        {
          id: 338,
          expirationDate: "2025-08-10",
          expirationType: "RTM",
          isSpecial: true,
          hasBanner: true,
          status: "Vigente",
          percentage: 100,
          icon: "default_icon",
          color: "green",
        },
      ],
      meta: {
        page: "1",
        take: "15",
        total: 11,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
  },
};

const GetOneExpirationPolizaTodoRiesgoResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración de tipo Póliza Todo Riesgo",
  schema: {
    example: {
      id: 407,
      expirationDate: null,
      reminders: [],
      estado: "Configurar",
      insurerId: 1,
      nameInsurer: "Sura",
      isSpecial: false,
      hasBanner: true,
      updatedAt: "2025-03-19T01:54:52.393Z",
      imageBanner:
        "https://equisoftfleetdev.blob.core.windows.net/equisoft-app-bucket/Baners%20app%20mobile%20Poliza%20Todo%20Riesgo.jpg?sp=r&st=2025-03-17T21:20:20Z&se=2026-03-18T05:20:20Z&spr=https&sv=2022-11-02&sr=b&sig=PVPVeBoqXTpRzytYc6OVyUNJ3ceYS1B%2FTAa%2F3bq%2BNyo%3D",
      linkBanner: "https://www.google.com/",
      description:
        "Contar con una Póliza de Seguro Todo Riesgo le brinda protección para usted, su vehículo y terceras partes.  Configure esta alerta y COTICE con nosotros.",
      icon: "assessment",
      color: "gray",
    },
  },
};

const CombinedGetOneExpirationResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene una expiración por id con múltiples ejemplos",
  content: {
    "application/json": {
      schema: {
        type: "object",
      },
      examples: {
        extintor: {
          summary: "Ejemplo de Extintor",
          value: GetOneExpirationExtintorResponse.schema.example,
        },
        kitDeCarretera: {
          summary: "Ejemplo de Kit de carretera",
          value: GetOneExpirationKitDeCarreteraResponse.schema.example,
        },
        soat: {
          summary: "Ejemplo de SOAT",
          value: GetOneExpirationSoatResponse.schema.example,
        },
        cambioDeLlantas: {
          summary: "Ejemplo de Cambio de llantas",
          value: GetOneExpirationCambioDeLlantasResponse.schema.example,
        },
        revisionDeFrenos: {
          summary: "Ejemplo de Revisión de frenos",
          value: GetOneExpirationRevisionDeFrenosResponse.schema.example,
        },
        cambioDeAceite: {
          summary: "Ejemplo de Cambio de aceite",
          value: GetOneExpirationCambioDeAceiteResponse.schema.example,
        },
        licenciaDeConduccion: {
          summary: "Ejemplo de Licencia de conducción",
          value: GetOneExpirationLicenciaDeConduccionResponse.schema.example,
        },
        rtm: {
          summary: "Ejemplo de RTM",
          value: GetOneExpirationRTMResponse.schema.example,
        },
        PolizaTodoRiesgo: {
          summary: "Ejemplo de Póliza Todo Riesgo",
          value: GetOneExpirationPolizaTodoRiesgoResponse.schema.example,
        },
      },
    },
  },
};

const GetErrorReloadResponse: ApiResponseOptions = {
  status: 400,
  description: "Ya utilizaste tu actualización este mes. Podrás realizar otra a partir del 5/16/2025",
  schema: {
    example: {
      message: "Ya utilizaste tu actualización este mes. Podrás realizar otra a partir del 5/16/2025",
      method: "GET",
      body: "{}",
      params: "{\"name\":\"soat\"}",
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-04-16T17:32:25.991Z",
      path: "/api/sign/v1/expiration/reload-expiration/soat",
      errors: null,
    },
  },
};

const GetReloadExpirationResponse: ApiResponseOptions = {
  status: 200,
  description: "Obtiene true si puede recargar la expiración",
  schema: {
    example: true,
  },
};

export {
  GetOneExpirationResponse,
  CreateExpirationResponse,
  UpdateExpirationResponse,
  GetOneExpirationExtintorResponse,
  GetOneExpirationKitDeCarreteraResponse,
  GetOneExpirationSoatResponse,
  GetOneExpirationCambioDeLlantasResponse,
  GetOneExpirationRevisionDeFrenosResponse,
  GetOneExpirationCambioDeAceiteResponse,
  GetOneExpirationLicenciaDeConduccionResponse,
  GetOneExpirationPicoYPlacaResponse,
  GetOneExpirationRTMResponse,
  GetAllExpirationsResponse,
  GetOneExpirationPolizaTodoRiesgoResponse,
  CombinedGetOneExpirationResponse,
  GetErrorReloadResponse,
  GetReloadExpirationResponse
};
