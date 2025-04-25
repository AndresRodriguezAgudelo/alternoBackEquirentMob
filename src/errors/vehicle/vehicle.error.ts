import { ErrorDetails } from "@/types/ErrorDetails.type";

const errorMessagesVehicles: { [key: string]: ErrorDetails } = {
  vehicle_not_found: {
    message: "Vehiculo no encontrado",
    errorType: "vehicle_not_found",
    status: 404,
  },
};

export default errorMessagesVehicles;
