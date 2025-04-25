import { HttpStatus } from "@nestjs/common";

export type ErrorDetails = {
  status: HttpStatus;
  errorType: string;
  message: string;
};
