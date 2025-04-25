import { ErrorDetails } from "@/types/ErrorDetails.type";
import { HttpStatus } from "@nestjs/common";

const errorMessagesInsurer: { [key: string]: ErrorDetails } = {
  insurer_not_found: {
    status: HttpStatus.NOT_FOUND,
    errorType: "insurer_not_found",
    message: "Aseguradora no encontrada",
  },
  insurer_exists: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "insurer_exists",
    message: "Aseguradora ya existe",
  },
  insurer_error: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "insurer_error",
    message: "Error en aseguradora",
  },
};

export default errorMessagesInsurer;
