import { ApiResponseOptions } from "@nestjs/swagger";

export const SendNotificationApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Notificación enviada correctamente",
  schema: {
    example: {
      correlationId: "095a9f27-e2ba-4233-bef8-d9c9c4ef1b20",
      trackingId: "723503ab-64e1-48a8-a8f8-e104811bc62b",
    },
  },
};
