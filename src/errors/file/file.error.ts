import { ErrorDetails } from "@/types/ErrorDetails.type";
import { HttpStatus } from "@nestjs/common";

const errorMessagesFile: { [key: string]: ErrorDetails } = {
  file_is_invalid: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "file_is_invalid",
    message: "El archivo no es válido",
  },
  file_size_exceeded: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "file_size_exceeded",
    message: "El tamaño del archivo excede el límite permitido",
  },
  file_not_sharp: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "file_not_sharp",
    message: "Error al procesar la imagen",
  },
  file_upload_failed: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "file_upload_failed",
    message: "Error al subir el archivo",
  },
  file_not_found: {
    status: HttpStatus.NOT_FOUND,
    errorType: "file_not_found",
    message: "Archivo no encontrado",
  },
};

export default errorMessagesFile;
