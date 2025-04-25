import { INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { constants } from "./common";

export const setSwaggerConfig = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle(`${constants.MICRO_NAME.toUpperCase()} API EQUIRENT APP`)
    .setDescription(
      "API EQUIRENT APP, you can download the yaml file in /v3/api-docs.yaml in the explore bar to import it in postman",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    `api/${constants.MICRO_NAME}/docs`.toLowerCase(),
    app,
    document,
    {
      customCssUrl:
        "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.1/themes/3.x/theme-feeling-blue.css",
      explorer: true,
      jsonDocumentUrl: `/v3/api-docs`,
      yamlDocumentUrl: `/v3/api-docs.yaml`,
    },
  );
};
