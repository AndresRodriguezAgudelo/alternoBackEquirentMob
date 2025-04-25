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
      "Endpoint=sb://equisoftfleet-superapp-dev.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=xIkLnylVLKvtrTw1WOUR7yNhNXDvH9JByNF/gkO6oKI=";
    const hubName =
      process.env.AZURE_NOTIFICATION_HUB_NAME || "equisoftfleet-superapp-dev";

    if (!connectionString || !hubName) {
      throw new Error("Falta la configuración de Azure Notification Hubs");
    }

    this.hubClient = new NotificationHubsClient(connectionString, hubName);
  }

  async sendFcmNotification(payload: any): Promise<any> {
    try {
      const notification = createFcmV1Notification(payload);
      const response = await this.hubClient.sendNotification(notification, {
        tagExpression: "android ",
      });
      this.logger.log("Notificación enviada FCM", response);
      return response;
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
      // Si no se proporcionan tags, se asigna "android" por defecto.
      if (tags.length === 0) {
        tags = ["android"];
      }
      installation = {
        installationId,
        pushChannel: deviceToken,
        platform: "fcmv1",
        tags,
      } as FcmV1Installation;
    } else if (platform.toLowerCase() === "ios") {
      // Para iOS se puede hacer lo mismo o asignar otro tag por defecto, por ejemplo "ios".
      if (tags.length === 0) {
        tags = ["ios"];
      }
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
