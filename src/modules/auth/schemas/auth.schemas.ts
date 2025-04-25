import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { z } from "zod";
class LoginDto {
  @ApiProperty({
    type: String,
  })
  @IsString({ message: "El teléfono debe ser una cadena de texto" })
  phone: string;

  @ApiProperty({
    type: String,
  })
  @IsString({ message: "El otp debe ser una cadena de texto" })
  otp: string;
}
const LoginSchema = z.object({
  phone: z
    .string({
      required_error: "El teléfono es requerido.",
      invalid_type_error: "El teléfono debe ser una cadena de texto.",
    })
    .refine((phone) => phone.length === 10, {
      message: "El teléfono debe tener exactamente 10 caracteres.",
    })
    .describe("El teléfono del usuario."),
  otp: z
    .string({
      required_error: "El otp es requerido.",
      invalid_type_error: "El otp debe ser una cadena de texto.",
    })
    .refine((otp) => otp.length === 4, {
      message: "El otp debe tener exactamente 4 caracteres.",
    })
    .describe("El otp del usuario."),
});

class LoginEmailDto {
  @ApiProperty({
    type: String,
  })
  @IsString({ message: "El correo debe ser una cadena de texto" })
  email: string;

  @ApiProperty({
    type: String,
  })
  @IsString({ message: "La contraseña debe ser una cadena de texto" })
  password: string;
}
const LoginEmailSchema = z.object({
  email: z
    .string({
      required_error: "El correo es requerido.",
      invalid_type_error: "El correo debe ser una cadena de texto.",
    })
    .refine((email) => email.length > 0, {
      message: "El correo no puede estar vacío.",
    })
    .describe("El correo del usuario."),
  password: z
    .string({
      required_error: "La contraseña es requerida.",
      invalid_type_error: "La contraseña debe ser una cadena de texto.",
    })
    .refine((password) => password.length > 0, {
      message: "La contraseña no puede estar vacía.",
    })
    .describe("La contraseña del usuario."),
});

export { LoginDto, LoginSchema, LoginEmailDto, LoginEmailSchema };
