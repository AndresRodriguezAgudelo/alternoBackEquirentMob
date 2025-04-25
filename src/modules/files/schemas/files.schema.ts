import { IsOptional, IsString } from "class-validator";

class FileDto {
  file?: any;
}

class FilesDto {
  file?: any;
  fileSecondary?: any;
  fileTertiary?: any;
}

class UploadFileDto {
  @IsOptional()
  file?: any;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export { FileDto, UploadFileDto, FilesDto };
