import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private currentMicroservice = "";

  constructor(currentMicroservice: string) {
    this.currentMicroservice = currentMicroservice;
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    delete request?.body?.password;

    const exceptionResponse = exception.getResponse();
    const isObjectResponse = typeof exceptionResponse === "object";

    let errorDetails = null;

    if (
      isObjectResponse &&
      "errors" in exceptionResponse &&
      Array.isArray(exceptionResponse["errors"])
    ) {
      errorDetails = exceptionResponse["errors"].map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
    }

    const responseMessage = {
      message: exception.message,
      method: request.method,
      body: JSON.stringify(request.body),
      params: JSON.stringify(request.params),
      currentMicroservice: this.currentMicroservice,
      status: status || 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors: errorDetails,
    };

    this.logger.error(
      `Validation error: ${JSON.stringify(responseMessage, null, 2)}`,
    );

    response.status(status).json(responseMessage);
  }
}
