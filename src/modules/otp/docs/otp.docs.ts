import { ApiResponseOptions } from "@nestjs/swagger";

const CreateOtpApiResponse: ApiResponseOptions = {
  status: 201,
  description: "OTP creado correctamente",
  schema: {
    example: {
      otp: "8018",
      type: "login",
      expireOn: "2025-02-10T19:52:12.000Z",
      userId: 1,
      verified: false,
      id: 1,
      createdAt: "2025-02-11T00:42:14.196Z",
      updatedAt: "2025-02-11T00:42:14.196Z",
      deletedAt: null,
    },
  },
};

const CreateOtpErrorApiResponse: ApiResponseOptions = {
  status: 400,
  description: "Error de validación en la creación del OTP",
  schema: {
    example: {
      message: "Validation failed",
      method: "POST",
      body: '{"type":"login"}',
      params: "{}",
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-10T19:45:19.334Z",
      path: "/api/sign/v1/otp/create",
      errors: [
        {
          path: "userId",
          message: "Required",
        },
      ],
    },
  },
};

const ValidateOtpSuccessApiResponse: ApiResponseOptions = {
  status: 201,
  description: "OTP validado correctamente",
  schema: {
    example: "OTP validado correctamente",
  },
};

const ValidateOtpErrorApiResponse: ApiResponseOptions = {
  status: 400,
  description: "Error de validación en la validación del OTP",
  schema: {
    example: {
      message: "Validation failed",
      method: "POST",
      body: '{"otp":"41012"}',
      params: "{}",
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-10T20:07:39.245Z",
      path: "/api/sign/v1/otp/validate",
      errors: [
        {
          path: "otp",
          message: "El OTP debe tener exactamente 4 caracteres",
        },
      ],
    },
  },
};

const ValidateUserSuccessApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Usuario validado correctamente",
  schema: {
    example: {
      userId: 69,
      validated: true,
    },
  },
};

export {
  CreateOtpApiResponse,
  CreateOtpErrorApiResponse,
  ValidateOtpSuccessApiResponse,
  ValidateOtpErrorApiResponse,
  ValidateUserSuccessApiResponse,
};
