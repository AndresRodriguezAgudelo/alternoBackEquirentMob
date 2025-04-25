import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

export const DatabaseProvider = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      type: "mssql",
      host: config.get("DATABASE_HOST"),
      port: parseInt(config.get("DATABASE_PORT")),
      database: config.get("DATABASE_NAME"),
      username: config.get("DATABASE_USER"),
      password: config.get("DATABASE_PASSWORD"),
      entities: [__dirname + "/../../modules/**/entities/*.entity{.ts,.js}"],
      migrations: [__dirname + "/../migrations/**/*.{.ts,.js}"],
      extra: {
        trustServerCertificate: true,
        encrypt: true,
      },
      logging: true,
      migrationsTableName: "migrations_typeorm",
      synchronize: true,
    }),
  }),
];
