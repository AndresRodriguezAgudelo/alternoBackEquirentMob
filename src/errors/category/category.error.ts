import { ErrorDetails } from "@/types/ErrorDetails.type";
import { HttpStatus } from "@nestjs/common";

const errorMessagesCategory: { [key: string]: ErrorDetails } = {
  category_not_found: {
    status: HttpStatus.NOT_FOUND,
    errorType: "category_not_found",
    message: "Categoría no encontrada",
  },
  category_exists: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "category_exists",
    message: "Categoría ya existe",
  },
  category_error: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "category_error",
    message: "Error en categoría",
  },
};

export default errorMessagesCategory;
