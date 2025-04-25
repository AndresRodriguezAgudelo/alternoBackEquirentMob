import {
  IsBoolean,
  IsDateString,
  IsString,
  Length,
  IsOptional,
  ValidateNested,
  IsArray,
  IsObject,
  IsInt,
} from "class-validator";
import { Type } from "class-transformer";
import {
  CreateReminderDto,
  CreateReminderSchema,
  UpdateReminderDto,
  UpdateReminderSchema,
} from "@/modules/reminder/schemas/reminder.schema";
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

class ExtraDataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  insurerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  insurer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastCDA?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: Date;
}

class CreateExpirationDto {
  @ApiProperty()
  @IsOptional()
  @IsDateString()
  expirationDate?: Date;

  @ApiProperty()
  @IsString()
  @Length(1, 50)
  expirationType: string;

  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBanner?: boolean;

  @ApiProperty()
  @IsInt()
  vehicleId: number;

  @ApiProperty({ type: CreateReminderDto, isArray: true, required: false })
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => CreateReminderDto)
  reminders?: CreateReminderDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: ExtraDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExtraDataDto)
  extraData?: ExtraDataDto;
}

class UpdateExpirationDto {

  @ApiProperty()
  @IsOptional()
  @IsString()
  expirationType?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  expirationDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  hasBanner?: boolean;

  @ApiProperty({ type: UpdateReminderDto, isArray: true, required: false })
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => UpdateReminderDto)
  reminders?: UpdateReminderDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: ExtraDataDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExtraDataDto)
  extraData?: ExtraDataDto;
}

const CreateExpirationSchema = z.object({
  expirationDate: z.string().datetime().optional(),
  expirationType: z.string().min(1).max(50),
  isSpecial: z.boolean().optional(),
  hasBanner: z.boolean().optional(),
  reminders: z.array(CreateReminderSchema).optional(),
  vehicleId: z.number().int().min(1),
  extraData: z
    .object({
      insurerId: z.number().int().optional(),
      policyNumber: z.string().optional(),
      insurer: z.string().optional(),
      lastCDA: z.string().optional(),
      category: z.string().optional(),
      service: z.string().optional(),
      lastMaintenanceDate: z.string().datetime().optional(),
    })
    .optional(),
});

const UpdateExpirationSchema = z.object({
  expirationType: z.string().min(1).max(50).optional(),
  expirationDate: z.string().datetime().optional(),
  isSpecial: z.boolean().optional(),
  hasBanner: z.boolean().optional(),
  reminders: z.array(UpdateReminderSchema).optional(),
  extraData: z
    .object({
      insurerId: z.number().int().optional(),
      policyNumber: z.string().optional(),
      insurer: z.string().optional(),
      lastCDA: z.string().optional(),
      category: z.string().optional(),
      service: z.string().optional(),
      lastMaintenanceDate: z.string().datetime().optional(),
    })
    .optional(),
});

export {
  CreateExpirationDto,
  UpdateExpirationDto,
  CreateExpirationSchema,
  UpdateExpirationSchema,
  ExtraDataDto,
};
