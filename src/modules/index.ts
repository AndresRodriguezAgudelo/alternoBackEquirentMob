import { Module } from "@nestjs/common";
import { CityModule } from "./city/city.module";
import { UserModule } from "./user/user.module";
import { VehicleModule } from "./vehicle/vehicle.module";
import { UserVehicleModule } from "./user-vehicle/user-vehicle.module";
import { DocumentTypeModule } from "./document-type/document-type.module";
import { ExpirationModule } from "./expiration/expiration.module";
import { OtpModule } from "./otp/otp.module";
import { FinesSimitModule } from "./fines-simit/fines-simit.module";
import { TwilioModule } from "./twilio/twilio.module";
import { AuthModule } from "./auth/auth.module";
import { InsurerModule } from "./insurer/insurer.module";
import { ReminderModule } from "./reminder/reminder.module";
import { ServicingModule } from "./servicing/servicing.module";
import { CategoryModule } from "./category/category.module";
import { GuidesModule } from "./guides/guides.module";
import { QueryHistoryModule } from "./query-history/query-history.module";
import { ListModule } from "./list/list.module";
import { PeakPlateModule } from "./peak-plate/peak-plate.module";
import { ReportsModule } from "./reports/reports.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ExpirationCronModule } from "./expiration-cron/expiration-cron.module";

@Module({
  imports: [
    CityModule,
    UserModule,
    VehicleModule,
    UserVehicleModule,
    DocumentTypeModule,
    ExpirationModule,
    OtpModule,
    FinesSimitModule,
    TwilioModule,
    AuthModule,
    InsurerModule,
    ReminderModule,
    ServicingModule,
    CategoryModule,
    GuidesModule,
    QueryHistoryModule,
    ExpirationModule,
    ListModule,
    PeakPlateModule,
    ReportsModule,
    NotificationsModule,
    ExpirationCronModule,
  ],
  controllers: [],
})
export class ApiModule {}
