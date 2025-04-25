import { z } from "zod";
import {
  IsEmail,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsPositive,
  IsUrl,
  IsDateString,
  IsBooleanString,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PageOptionsDto } from "@/common";

class CreateUserDto {
  @ApiProperty({
    example: "usuario@example.com",
    description: "Correo electrónico válido",
  })
  @IsEmail({}, { message: "El correo debe ser un email válido" })
  @MaxLength(255, { message: "El correo no puede superar los 255 caracteres" })
  email: string;

  @ApiProperty({ example: "Juan Pérez", description: "Nombre del usuario" })
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(1, { message: "El nombre es obligatorio" })
  @MaxLength(255, { message: "El nombre no puede superar los 255 caracteres" })
  name: string;

  @ApiProperty({
    example: true,
    description: "Indica si el usuario acepta los términos",
  })
  @IsBoolean({ message: "El campo accepted debe ser un booleano" })
  accepted: boolean;

  @ApiProperty({ example: 1, description: "ID de la ciudad asociada" })
  @IsInt({ message: "El ID de la ciudad debe ser un número entero" })
  @IsPositive({ message: "El ID de la ciudad debe ser un número positivo" })
  cityId: number;

  @ApiPropertyOptional({
    example: "3001234567",
    description: "Número de teléfono del usuario",
  })
  @IsOptional()
  @IsString({ message: "El teléfono debe ser una cadena de texto" })
  @MaxLength(10, { message: "El teléfono no puede superar los 10 caracteres" })
  phone?: string | null;
}

class UpdateUserDto {
  @ApiPropertyOptional({
    example: "usuario@example.com",
    description: "Correo electrónico válido",
  })
  @IsOptional()
  @IsEmail({}, { message: "El correo debe ser un email válido" })
  @MaxLength(255, { message: "El correo no puede superar los 255 caracteres" })
  email?: string;

  @ApiPropertyOptional({
    example: "Juan Pérez",
    description: "Nombre del usuario",
  })
  @IsOptional()
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(1, { message: "El nombre es obligatorio" })
  @MaxLength(255, { message: "El nombre no puede superar los 255 caracteres" })
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Indica si el usuario acepta los términos",
  })
  @IsOptional()
  @IsBoolean({ message: "El campo accepted debe ser un booleano" })
  accepted?: boolean;

  @ApiPropertyOptional({ example: 1, description: "ID de la ciudad asociada" })
  @IsOptional()
  @IsInt({ message: "El ID de la ciudad debe ser un número entero" })
  @IsPositive({ message: "El ID de la ciudad debe ser un número positivo" })
  cityId?: number;

  @ApiPropertyOptional({
    example: "https://example.com/foto.jpg",
    description: "URL de la foto de perfil",
  })
  @IsOptional()
  @IsString({ message: "La foto debe ser una cadena de texto" })
  @IsUrl({}, { message: "La foto debe ser una URL válida" })
  photo?: string | null;

  @ApiPropertyOptional({
    example: "3001234567",
    description: "Número de teléfono del usuario",
  })
  @IsOptional()
  @IsString({ message: "El teléfono debe ser una cadena de texto" })
  @MaxLength(10, { message: "El teléfono no puede superar los 10 caracteres" })
  phone?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: "Indica si el usuario esta activo o inactivo",
  })
  @IsOptional()
  @IsBoolean({ message: "El campo status debe ser un booleano" })
  status?: boolean;

  verify?: boolean;
  
}

class UpdatePhoneDto {
  @ApiProperty({
    example: "3001234567",
    description: "Número de teléfono del usuario",
  })
  @IsOptional()
  @IsString({ message: "El teléfono debe ser una cadena de texto" })
  @MaxLength(10, { message: "El teléfono no puede superar los 10 caracteres" })
  phone?: string;

  @ApiProperty({ example: "1234", description: "Código OTP de 4 dígitos." })
  @IsOptional()
  @IsString({ message: "El OTP debe ser una cadena de texto" })
  @Length(4, 4, { message: "El OTP debe tener exactamente 4 caracteres" })
  otp?: string;
}

class RecoveryAccountDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;
}

const UpdatePhoneSchema = z.object({
  phone: z
    .string()
    .max(10, { message: "El teléfono no puede superar los 10 caracteres" })
    .optional(),
  otp: z
    .string()
    .length(4, { message: "El OTP debe tener exactamente 4 caracteres" })
    .optional(),
});

const RecoveryAccount = z.object({
  email: z
    .string()
    .email({ message: "El correo debe ser un email válido" })
    .optional(),
});

class ResetPasswordDto {
  @ApiProperty({
    example: "usuario@example.com",
    description: "Correo del usuario para restablecer contraseña",
  })
  @IsEmail({}, { message: "El correo debe ser un email válido" })
  @MaxLength(255, { message: "El correo no puede superar los 255 caracteres" })
  email: string;
}

const UserSchema = z.object({
  email: z
    .string()
    .email({ message: "El correo debe ser un email válido" })
    .max(255),
  name: z.string().min(1, { message: "El nombre es obligatorio" }).max(255),
  accepted: z.boolean().default(false),
  cityId: z
    .number()
    .int()
    .positive({ message: "El ID de la ciudad debe ser un número positivo" }),
  phone: z
    .string()
    .max(10, { message: "El teléfono no puede superar los 10 caracteres" })
    .nullable()
    .optional(),
  status: z.boolean().nullable().optional(),
});

const CreateUserSchema = UserSchema.pick({
  email: true,
  name: true,
  cityId: true,
  accepted: true,
  phone: true,
  status: true,
});

const UpdateUserSchema = UserSchema.partial();

const ResetPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "El correo debe ser un email válido" })
    .max(255),
});

class FiltersDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: "Filtro por fecha de inicio",
    example: "2021-01-01",
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Filtro por fecha de fin",
    example: "2021-12-31",
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({ description: "Filtro por status" })
  @IsOptional()
  @IsBooleanString()
  status?: any;

  @ApiPropertyOptional({
    description: "Filtro por total de vehiculos",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  totalVehicles?: number;
}

class UpdateResetPasswordDto {
  @IsString({ message: "El token debe ser valido" })
  token: string;
  @IsString({ message: "La nueva contraseña debe ser valida" })
  newPassword: string;
  @IsString({ message: "La confirmación de la contraseña debe ser valida" })
  confirmPassword: string;
}

const UpdateResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

export {
  CreateUserDto,
  UpdateUserDto,
  ResetPasswordDto,
  CreateUserSchema,
  UpdateUserSchema,
  ResetPasswordSchema,
  FiltersDto,
  UpdatePhoneDto,
  UpdatePhoneSchema,
  UpdateResetPasswordDto,
  UpdateResetPasswordSchema,
  RecoveryAccountDto,
  RecoveryAccount,
};
