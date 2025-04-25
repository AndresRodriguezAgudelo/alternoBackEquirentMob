import { ErrorDetails } from "@/types/ErrorDetails.type";
import { HttpStatus } from "@nestjs/common";

const errorMessagesDocument: { [key: string]: ErrorDetails } = {
  document_not_found: {
    status: HttpStatus.NOT_FOUND,
    errorType: "document_not_found",
    message: "Documento no encontrado",
  },
  document_exists: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "document_exists",
    message: "Documento ya existe",
  },
  document_error: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "document_error",
    message: "Error en documento",
  },
};

export default errorMessagesDocument;
