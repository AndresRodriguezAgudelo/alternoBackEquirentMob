import { Controller, Post, Body } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import {
  RegisterDeviceDto,
  RegisterDeviceSchema,
} from "../schemas/notifications.schema";
import { IUser } from "@/interfaces/user.interface";
import { User } from "@/common/decorators/user.decorators";
import { Auth } from "@/common/decorators/auth.decorators";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { NotificationService } from "../services/notifications.service";
import { SendNotificationApiResponse } from "../docs/notifications.doc";

@Auth()
@ApiTags("Notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationHubsService: NotificationService) {}

  @ApiOkResponse(SendNotificationApiResponse)
  @Post("register")
  async registerDevice(
    @Body(new ZodValidationPipe(RegisterDeviceSchema)) body: RegisterDeviceDto,
    @User() user: IUser,
  ): Promise<any> {
    const { deviceToken, platform, tags } = body;
    const installationId = deviceToken;
    return await this.notificationHubsService.registerDevice(
      installationId,
      deviceToken,
      platform,
      tags,
      user.id,
    );
  }

  @Post("send/fcm")
  async sendFcmNotification(@Body() payload: any): Promise<any> {
    return await this.notificationHubsService.sendFcmNotification(payload, "");
  }

  @Post("send/apns")
  async sendApnsNotification(@Body() payload: any): Promise<any> {
    return await this.notificationHubsService.sendApnsNotification(payload);
  }
}
