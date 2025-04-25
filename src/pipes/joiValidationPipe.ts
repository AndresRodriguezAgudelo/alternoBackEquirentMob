import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { ObjectSchema } from "joi";

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  private readonly logger = new Logger(JoiValidationPipe.name);

  constructor(private readonly schema: ObjectSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value, { abortEarly: false });

    if (error) {
      this.logger.error(
        `Validation error in ${metadata.type}: ${error.details
          .map((err) => err.message)
          .join(", ")}`,
      );

      throw new BadRequestException({
        message: "Validation faileds",
        errors: error.details.map((err) => ({
          message: err.message,
          path: err.path.join("."),
        })),
      });
    }
    return value;
  }
}
