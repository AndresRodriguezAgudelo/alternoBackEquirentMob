// FIXME: MOVE THIS TO ENV
import { NotificationsRepository } from "@/modules/notifications/repositories/notifications.repository";
import { Injectable, Logger } from "@nestjs/common";
import {
  NotificationHubsClient,
  createFcmV1Notification,
  createAppleNotification,
  AppleInstallation,
  FcmV1Installation,
} from "@azure/notification-hubs";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private hubClient: NotificationHubsClient;
  // FIXME: MOVE THIS TO ENV
  constructor(private readonly deviceRegRepo: NotificationsRepository) {
    const connectionString =
      process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING ||
      "Endpoint=sb://equisoftfleet-superapp-dev.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=0EQjppmwlbI5zSaeeS2xzL/qxrIkSTQYHOgQI86y6sU=";
    const hubName =
      process.env.AZURE_NOTIFICATION_HUB_NAME || "equisoftfleet-superapp-dev";

    if (!connectionString || !hubName) {
      throw new Error("Falta la configuración de Azure Notification Hubs");
    }

    this.hubClient = new NotificationHubsClient(connectionString, hubName);
  }

  async sendFcmNotification(payload: any, token: string): Promise<any> {
    try {
      const notification = createFcmV1Notification({ body: payload });
      console.log("notification", JSON.stringify(notification, null, 2));
      const result = await this.hubClient.sendNotification(notification, {
        deviceHandle: token,
      });
      console.log("Notification sent", result);
      console.log(`Direct send Tracking ID: ${result.trackingId}`);
      console.log(`Direct send Correlation ID: ${result.correlationId}`);

      // Only available in Standard SKU and above
      if (result.notificationId) {
        console.log(`Direct send Notification ID: ${result.notificationId}`);

        const results = await this.hubClient.getNotificationOutcomeDetails(
          result.notificationId,
        );
        if (results) {
          console.log(JSON.stringify(results, null, 2));
        }
      }
      return result;
    } catch (error) {
      this.logger.error("Error enviando notificación FCM", error);
      throw error;
    }
  }

  async sendApnsNotification(payload: any): Promise<any> {
    try {
      const notification = createAppleNotification(payload);
      const response = await this.hubClient.sendNotification(notification, {
        tagExpression: "",
      });
      this.logger.log("Notificación enviada APNS", response);
      return response;
    } catch (error) {
      this.logger.error("Error enviando notificación APNS", error);
      throw error;
    }
  }

  async registerDevice(
    installationId: string,
    deviceToken: string,
    platform: string,
    tags: string[] = [],
    userId?: number,
  ): Promise<any> {
    let installation: FcmV1Installation | AppleInstallation;

    if (platform.toLowerCase() === "android") {
      
      installation = {
        installationId,
        pushChannel: deviceToken,
        platform: "fcmv1",
        tags,
      } as FcmV1Installation;
    } else if (platform.toLowerCase() === "ios") {
      installation = {
        installationId,
        pushChannel: deviceToken,
        platform: "apns",
        tags,
      } as AppleInstallation;
    } else {
      throw new Error("Plataforma no soportada");
    }

    try {
      const response = await this.hubClient.createOrUpdateInstallation(
        installation,
      );
      this.logger.log(`Dispositivo ${platform} registrado`, response);

      if (userId) {
        await this.deviceRegRepo.createAndSave({
          deviceToken,
          registrationId: installationId,
          platform,
          tags,
          userId,
        });
      }
      return response;
    } catch (error) {
      this.logger.error(`Error registrando dispositivo ${platform}`, error);
      throw error;
    }
  }

  async getDeviceRegistrations(userId: number): Promise<any> {
    return await this.deviceRegRepo.findByUser(userId);
  }
}
