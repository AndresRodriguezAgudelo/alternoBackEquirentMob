import { emailConfig } from "@/common/utils/MailConfig";
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(
    to: string[],
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: `"Equirent APP" <${emailConfig.auth.user}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Mensaje enviado: %s", info.messageId);
  }

  async sendEmailWithAttachment(
    to: string[],
    subject: string,
    text: string,
    html: string,
    attachmentPath: string,
    attachmentFilename: string,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: `"Equirent APP" <${emailConfig.auth.user}>`,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: attachmentFilename,
          path: attachmentPath,
        },
      ],
    });
    console.log("Mensaje enviado: %s", info.messageId);
  }
}
