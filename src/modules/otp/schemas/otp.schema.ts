import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, IsIn } from "class-validator";
import { z } from "zod";
class CreateOtpDto {
  @ApiProperty({
    enum: ["login", "register", "reset"],
    description: 'Tipo de OTP, puede ser "login", "register" o "reset".',
  })
  @IsString()
  @IsIn(["login", "register", "reset"], {
    message: 'El tipo debe ser "login", "register" o "reset"',
  })
  type: string;

  @ApiProperty({ example: 123, description: "ID del usuario asociado al OTP." })
  @IsString({ message: "El teléfono debe ser una cadena de texto" })
  phone: string;
}

class ValidateOtpDto {
  @ApiProperty({ example: "1234", description: "Código OTP de 4 dígitos." })
  @IsString({ message: "El OTP debe ser una cadena de texto" })
  @Length(4, 4, { message: "El OTP debe tener exactamente 4 caracteres" })
  otp: string;
}

const CreateOtpSchema = z.object({
  type: z.enum(["login", "register", "reset"], {
    description: "El tipo debe ser 'login', 'register' o 'reset'",
  }),
  phone: z
    .string()
    .length(10, "El teléfono debe tener exactamente 10 caracteres"),
});

const ValidateOtpSchema = z.object({
  otp: z.string().length(4, "El OTP debe tener exactamente 4 caracteres"),
});

export { CreateOtpDto, ValidateOtpDto, CreateOtpSchema, ValidateOtpSchema };
