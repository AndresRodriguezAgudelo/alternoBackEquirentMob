import { ApiResponseOptions } from "@nestjs/swagger";

const CreateUserErrorApiResponse: ApiResponseOptions = {
  status: 400,
  description: "Error de validación en la creación del usuario",
  schema: {
    example: {
      message: "Validation failed",
      method: "POST",
      body: '{"email":"neiderhamburger99+14@gmail.com","name":"NeiderHamburger","accepted":true}',
      params: "{}",
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-10T21:54:13.002Z",
      path: "/api/sign/v1/user",
      errors: [
        {
          path: "cityId",
          message: "Required",
        },
      ],
    },
  },
};

const CreateUserSuccessApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Usuario creado correctamente",
  schema: {
    example: {
      email: "neiderhamburger99+14@gmail.com",
      name: "NeiderHamburger",
      cityId: 1,
      accepted: true,
      photo: null,
      id: 18,
      createdAt: "2025-02-11T02:49:52.230Z",
      updatedAt: "2025-02-11T02:49:52.230Z",
      deletedAt: null,
      phone: null,
    },
  },
};

const GetUsersApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Lista de usuarios paginada",
  schema: {
    example: {
      data: [
        {
          id: 20,
          email: "neiderhamburger99+7@gmail.com",
          name: "Juan Pérez",
          accepted: true,
          phone: null,
          verify: false,
          userVehicles: [],
        },
        {
          id: 21,
          email: "neiderhamburger99+71@gmail.com",
          name: "Juan Pérez",
          accepted: true,
          phone: null,
          verify: false,
          userVehicles: [],
        },
        {
          id: 22,
          email: "neiderhamburger99+99@gmail.com",
          name: "Juan Pérez",
          accepted: true,
          phone: null,
          verify: false,
          userVehicles: [],
        },
        {
          id: 24,
          email: "neiderhamburger99+90@gmail.com",
          name: "neider fernando",
          accepted: true,
          phone: null,
          verify: false,
          userVehicles: [],
        },
        {
          id: 19,
          email: "usuario@example.com",
          name: "NeiderHamburger",
          accepted: true,
          phone: "3207857400",
          verify: false,
          userVehicles: [
            {
              id: 2,
              vehicle: {
                licensePlate: "ABwCs1d23",
                numberDocument: "123456789",
                dateRegister: null,
                typeDocument: {
                  typeName: "CC",
                },
              },
            },
            {
              id: 3,
              vehicle: {
                licensePlate: "ABt123",
                numberDocument: "123456789",
                dateRegister: null,
                typeDocument: {
                  typeName: "CC",
                },
              },
            },
          ],
        },
      ],
      meta: {
        page: "1",
        take: "10",
        total: 5,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
  },
};

const GetUserByIdApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Detalles de un usuario específico",
  schema: {
    example: {
      id: 20,
      email: "juanperez@example.com",
      name: "Juan Pérez",
      accepted: true,
      cityId: 1,
      city: {
        cityName: "Bogotá",
      },
      photo: "https://example.com/foto.jpg",
      phone: "3001234567",
    },
  },
};

const UpdateUserSuccessApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Usuario actualizado correctamente",
  schema: {
    example: "Usuario actualizado correctamente",
  },
};

const UpdateUserErrorApiResponse: ApiResponseOptions = {
  status: 400,
  description: "Error en la actualización del usuario",
  schema: {
    example: {
      message: "Usuario no encontrado",
      method: "PATCH",
      body: '{"email":"usuario@example.com"}',
      params: '{"id":"1"}',
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-10T22:46:14.988Z",
      path: "/api/sign/v1/user/1",
      errors: null,
    },
  },
};

const ResetPasswordSuccessApiResponse: ApiResponseOptions = {
  status: 201,
  description: "Correo de restablecer contraseña enviado correctamente",
  schema: {
    example: "Correo de restablecer contraseña enviado correctamente",
  },
};

const ResetPasswordErrorApiResponse: ApiResponseOptions = {
  status: 400,
  description: "Error en el restablecimiento de contraseña",
  schema: {
    example: {
      message: "El usuario no existe",
      method: "POST",
      body: '{"email":"usuario@examples.com"}',
      params: "{}",
      currentMicroservice: "equisoft-backend-app",
      status: 400,
      timestamp: "2025-02-10T22:49:39.396Z",
      path: "/api/sign/v1/user/reset-password",
      errors: null,
    },
  },
};

const SendVerificationCodeSuccessApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Código de verificación enviado correctamente",
  schema: {
    example: {
      message: "Código de verificación enviado correctamente",
      userId: 19,
    },
  },
};

const UpdateProfilePhotoApiResponse: ApiResponseOptions = {
  status: 200,
  description: "Foto de perfil actualizada correctamente",
  schema: {
    example: {
      message: "Foto de perfil actualizada correctamente",
      data: {
        photo:
          "profile-photo/Screenshot 2025-03-19 at 11.22.24 AM.png-1742409158159.webp",
      },
    },
  },
};

export {
  SendVerificationCodeSuccessApiResponse,
  CreateUserErrorApiResponse,
  CreateUserSuccessApiResponse,
  GetUsersApiResponse,
  GetUserByIdApiResponse,
  UpdateUserSuccessApiResponse,
  UpdateUserErrorApiResponse,
  ResetPasswordErrorApiResponse,
  ResetPasswordSuccessApiResponse,
  UpdateProfilePhotoApiResponse,
};
