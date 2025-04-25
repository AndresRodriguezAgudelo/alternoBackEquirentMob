import { Injectable } from "@nestjs/common";
import * as Twilio from "twilio";

@Injectable()
export class TwilioService {
  private smsClient: Twilio.Twilio;
  private whatsappClient: Twilio.Twilio;

  constructor() {
    this.setupClients();
  }
  // FIXME: MOVE THIS TO ENV
  private setupClients() {
    // Cliente para SMS con las credenciales correspondientes
    this.smsClient = Twilio(
      "AC0ee7ba32f20dbae46ed9d7ee4249c18c", // Key para SMS
      "d8652259559a4cf77adc402aa19419a8"  // Auth Token para SMS
    );

    // Cliente para WhatsApp con las credenciales correspondientes
    this.whatsappClient = Twilio(
      "AC8fbe8d526ece107484d1f5aa289d964a", // Key para WhatsApp
      "e03d3fe2cbd7eacfd9d120d3edffd20b"  // Auth Token para WhatsApp
    );
  }

  async sendSms(to: string, body: string): Promise<void> {
    const from = "+18312186672"; // Número de origen para SMS
    await this.smsClient.messages.create({
      to,
      from,
      body,
    });
  }

  async sendWhatsapp(to: string, body: string): Promise<void> {
    const from = "whatsapp:+573203473708"; // Número de origen para WhatsApp
    await this.whatsappClient.messages.create({
      to: `whatsapp:${to}`,
      from,
      body,
    });
  }

  async sendTemplateWhatsapp(
    to: string,
    contentSid: string,
    variables: Record<string, string>,
  ): Promise<void> {
    const from = "whatsapp:+573203473708";
    await this.whatsappClient.messages.create({
      to: `whatsapp:${to}`,
      from,
      contentSid,
      contentVariables: JSON.stringify(variables),
    });
  }
}
