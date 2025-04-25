import { HttpStatus } from "@nestjs/common";

const errorMessagesCommon = {
  internal_server_error: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    errorType: "internal_server_error",
    message: "An unexpected error occurred. Please try again later.",
  },
  bad_request: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "bad_request",
    message: "Invalid request data. Please check the input.",
  },
  resource_not_found: {
    status: HttpStatus.NOT_FOUND,
    errorType: "resource_not_found",
    message: "The requested resource could not be found.",
  },
};

export default errorMessagesCommon;
