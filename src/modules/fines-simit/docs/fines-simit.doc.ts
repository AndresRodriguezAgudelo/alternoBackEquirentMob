import { ApiResponseOptions } from "@nestjs/swagger";

const SimitSuccessResponse: ApiResponseOptions = {
  status: 200,
  description:
    "Éxito: Información de comparendos y multas obtenida correctamente.",
  schema: {
    example: {
      comparendos_multas: 3,
      totalPagar: 4213402,
      mensaje: "🚨 Tiene 0 comparendo(s) - 3 multa(s) pendiente(s) por pagar ",
      detallesComparendos: [
        {
          numeroMulta: "000693702",
          fecha: "22/02/2012",
          codigoInfraccion: "C24...",
          descripcionInfraccion:
            "Conducir motocicleta sin observar las normas establecidas en el presente código.",
          estado: "Cobro coactivo",
          valorPagar: 1027048,
          detalleValor: {
            valorBase: "$267.800",
            descuentoCapital: "N/A",
            intereses: "$732.468",
            descuentoIntereses: "N/A",
            valorAdicional: "$26.780",
          },
        },
        {
          numeroMulta: "20119444",
          fecha: "16/11/2011",
          codigoInfraccion: "57...",
          descripcionInfraccion:
            "Conducir motocicleta sin observar las normas establecidas en el presente código.",
          estado: "Cobro coactivo",
          valorPagar: 1062118,
          detalleValor: {
            valorBase: "$267.800",
            descuentoCapital: "N/A",
            intereses: "$767.538",
            descuentoIntereses: "N/A",
            valorAdicional: "$26.780",
          },
        },
        {
          numeroMulta: "20119675",
          fecha: "16/11/2011",
          codigoInfraccion: "74...",
          descripcionInfraccion:
            "Guiar un vehículo sin haber obtenido la licencia de conducción correspondiente. Además, el vehículo será inmovilizado...",
          estado: "Cobro coactivo",
          valorPagar: 2124236,
          detalleValor: {
            valorBase: "$535.600",
            descuentoCapital: "N/A",
            intereses: "$1.535.076",
            descuentoIntereses: "N/A",
            valorAdicional: "$53.560",
          },
        },
      ],
    },
  },
};
const SimitBadRequestResponse: ApiResponseOptions = {
  status: 400,
  description:
    "Error: La página no respondió a tiempo o hubo un problema con la solicitud.",
  schema: {
    example: {
      message: "⏳ La página no respondió a tiempo. Intenta más tarde.",
      method: "GET",
      body: "{}",
      params: '{"search":"1143469219"}',
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-11T02:46:15.964Z",
      path: "/api/sign/v1/fines-simit/1143469219",
      errors: null,
    },
  },
};

export { SimitSuccessResponse, SimitBadRequestResponse };
