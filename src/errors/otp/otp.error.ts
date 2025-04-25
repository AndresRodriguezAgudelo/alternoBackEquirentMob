import { ErrorDetails } from "@/types/ErrorDetails.type";
import { HttpStatus } from "@nestjs/common";

const errorMessagesOtp: { [key: string]: ErrorDetails } = {
  not_found_otp: {
    status: HttpStatus.NOT_FOUND,
    errorType: "not_found_otp",
    message: "OTP no encontrado",
  },
  not_valid_otp: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "not_valid_otp",
    message: "OTP no válido",
  },
  caducate_otp: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "caducate_otp",
    message: "OTP caducado",
  },
  used_otp_again: {
    status: HttpStatus.BAD_REQUEST,
    errorType: "used_otp_again",
    message: "OTP ya utilizado",
  },
};

export default errorMessagesOtp;
