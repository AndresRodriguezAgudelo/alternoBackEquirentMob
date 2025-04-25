import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { EnvModule } from "./config/environment/env.module";
import { DatabaseModule } from "./config/database/database.module";
import { ApiModule } from "./modules";
@Module({
  imports: [
    EnvModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    ApiModule,
  ],
})
export class AppModule {}
