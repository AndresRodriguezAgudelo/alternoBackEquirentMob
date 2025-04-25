import { HttpException, HttpStatus } from "@nestjs/common";
import errorMessages from "../../errors";

/**
 * Throws a custom error based on the provided error code.
 *
 * @param {string} errorCode - The code representing the specific error.
 * @throws {HttpException} Throws an HttpException with the corresponding error details.
 * If the error code is not found, it throws an HttpException with a status of 500 and an unknown error message.
 */
export function throwCustomError(errorCode: string): void {
  const errorDetail = errorMessages[errorCode];

  if (errorDetail) {
    throw new HttpException(
      {
        status: errorDetail.status,
        errorType: errorDetail.errorType,
        message: errorDetail.message,
      },
      errorDetail.status,
    );
  } else {
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorType: "unknown_error",
        message: "An unknown error occurred.",
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Generates API response options based on the provided error code.
 *
 * @param errorCode - The error code used to look up the corresponding error details.
 * @returns An object containing the status, description, and schema for the API response.
 *
 * The returned object has the following structure:
 * - `status`: The HTTP status code associated with the error.
 * - `description`: A description of the error.
 * - `schema`: An object defining the structure of the error response, including:
 *   - `status`: The HTTP status code.
 *   - `errorType`: A string representing the type of error.
 *   - `message`: A message describing the error.
 *
 * If the error code is not found in the `errorMessages` object, the function returns a default
 * response indicating an internal server error.
 */
export function generateApiResponseOptions(errorCode: string) {
  const errorDetail = errorMessages[errorCode];

  if (errorDetail) {
    return {
      status: errorDetail.status,
      description: errorDetail.message,
      schema: {
        type: "object",
        properties: {
          status: { type: "number", example: errorDetail.status },
          errorType: { type: "string", example: errorDetail.errorType },
          message: { type: "string", example: errorDetail.message },
        },
      },
    };
  } else {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "An unknown error occurred.",
      schema: {
        type: "object",
        properties: {
          status: { type: "number", example: HttpStatus.INTERNAL_SERVER_ERROR },
          errorType: { type: "string", example: "unknown_error" },
          message: { type: "string", example: "An unknown error occurred." },
        },
      },
    };
  }
}
