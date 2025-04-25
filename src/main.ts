import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { json } from "express";
import * as express from "express";
import * as morgan from "morgan";
import * as compression from "compression";
import helmet from "helmet";
import { join } from "path";

import { AppModule } from "./app.module";
import { setSwaggerConfig } from "./swagger.config";
import { HttpExceptionFilter } from "./common/filters/error/httpExceptionFilter";
import { constants } from "./common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const expressApp = app.getHttpAdapter().getInstance();

  app.useGlobalFilters(new HttpExceptionFilter("equisoft-backend-app"));

  app.setGlobalPrefix(`api/${constants.MICRO_NAME}`.toLowerCase());

  const logger = new Logger("NestApplication");

  app.use(helmet());
  app.use(compression());
  app.use(json({ limit: "5mb" }));
  app.use(morgan("dev"));

  if (constants.NODE_ENVIRONMENT == "DEVELOPMENT") {
    setSwaggerConfig(app);
  }

  expressApp.use(express.static(join(__dirname, "..", "public")));
  expressApp.set("views", join(__dirname, "..", "src/modules/templates/views"));
  expressApp.set("view engine", "pug");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          scriptSrcAttr: ["'none'", "'unsafe-inline'"],
          imgSrc: [
            "'self'",
            "data:",
            "https://equisoftfleetdev.blob.core.windows.net/",
          ],
        },
      },
    }),
  );

  await app.listen(constants.PORT, () =>
    logger.log(`Server is running on port ${constants.PORT}`),
  );
}
bootstrap();
