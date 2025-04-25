import { ErrorDetails } from "@/types/ErrorDetails.type";
import { HttpStatus } from "@nestjs/common";

const errorMessagesCity: { [key: string]: ErrorDetails } = {
  city_not_found: {
    status: HttpStatus.NOT_FOUND,
    errorType: "city_not_found",
    message: "Ciudad no encontrada",
  },
  city_exists: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "city_exists",
    message: "La ciudad ya existe",
  },
  city_error: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "city_error",
    message: "Error al actualizar la ciudad",
  },
};

export default errorMessagesCity;
