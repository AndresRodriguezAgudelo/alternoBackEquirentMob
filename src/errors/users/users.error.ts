import { ErrorDetails } from "@/types/ErrorDetails.type";

const errorMessagesUsers: { [key: string]: ErrorDetails } = {
  not_found_user: {
    message: "Usuario no encontrado",
    status: 404,
    errorType: "not_found_user",
  },
  user_is_inactive: {
    message: "El usuario está inactivo",
    status: 400,
    errorType: "user_is_inactive",
  },
  send_mail_error: {
    message: "Error al enviar el correo",
    status: 400,
    errorType: "send_mail_error",
  },
  user_exists: {
    message: "El usuario ya existe",
    status: 400,
    errorType: "user_exists",
  },
  user_error: {
    message: "Error al actualizar el usuario",
    status: 400,
    errorType: "user_error",
  },
  phone_exists: {
    message: "El número de teléfono ya existe",
    status: 400,
    errorType: "phone_exists",
  },
};

export default errorMessagesUsers;
