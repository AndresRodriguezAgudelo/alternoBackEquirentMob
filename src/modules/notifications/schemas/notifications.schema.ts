import { IsString, IsOptional, IsArray } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export class RegisterDeviceDto {
  @ApiProperty({
    description:
      "Token del dispositivo, obtenido desde el servicio de notificaciones nativo (FCM o APNS)",
    example: "d4f8b6c9e0f2g1h3i4j5k6l7m8n9o0p1",
  })
  @IsString()
  deviceToken: string;

  @ApiProperty({
    description: 'Plataforma del dispositivo. Ejemplo: "android" o "ios".',
    example: "android",
  })
  @IsString()
  platform: string;

  @ApiPropertyOptional({
    description:
      "Tags opcionales para segmentar el dispositivo (ej.: id del usuario, roles, etc.)",
    example: ["user_123", "premium"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
export const RegisterDeviceSchema = z.object({
  deviceToken: z.string(),
  platform: z.string(),
  tags: z.array(z.string()).optional(),
});
