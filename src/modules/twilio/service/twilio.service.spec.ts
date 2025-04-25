import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from './twilio.service';
import * as Twilio from 'twilio';

jest.mock('twilio');

describe('TwilioService', () => {
  let service: TwilioService;
  let smsClientMock: any;
  let whatsappClientMock: any;

  beforeEach(async () => {
    smsClientMock = {
      messages: {
        create: jest.fn(),
      },
    };

    whatsappClientMock = {
      messages: {
        create: jest.fn(),
      },
    };

    (Twilio as unknown as jest.Mock).mockImplementation((accountSid: string, authToken: string) => {
      if (accountSid === "AC0ee7ba32f20dbae46ed9d7ee4249c18c") {
        return smsClientMock;
      } else if (accountSid === "AC8fbe8d526ece107484d1f5aa289d964a") {
        return whatsappClientMock;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [TwilioService],
    }).compile();

    service = module.get<TwilioService>(TwilioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSms', () => {
    it('should send an SMS message successfully', async () => {
      smsClientMock.messages.create.mockResolvedValue({});

      await service.sendSms('+1234567890', 'Hello from SMS');

      expect(smsClientMock.messages.create).toHaveBeenCalledWith({
        to: '+1234567890',
        from: '+18312186672',
        body: 'Hello from SMS',
      });
      expect(smsClientMock.messages.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when sending SMS', async () => {
      smsClientMock.messages.create.mockRejectedValue(new Error('Failed to send SMS'));

      await expect(service.sendSms('+1234567890', 'Hello from SMS')).rejects.toThrow(
        'Failed to send SMS'
      );

      expect(smsClientMock.messages.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendWhatsapp', () => {
    it('should send a WhatsApp message successfully', async () => {
      whatsappClientMock.messages.create.mockResolvedValue({});

      await service.sendWhatsapp('+1234567890', 'Hello from WhatsApp');

      expect(whatsappClientMock.messages.create).toHaveBeenCalledWith({
        to: 'whatsapp:+1234567890',
        from: 'whatsapp:+573203473708',
        body: 'Hello from WhatsApp',
      });
      expect(whatsappClientMock.messages.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when sending WhatsApp messages', async () => {
      whatsappClientMock.messages.create.mockRejectedValue(new Error('Failed to send WhatsApp message'));

      await expect(service.sendWhatsapp('+1234567890', 'Hello from WhatsApp')).rejects.toThrow(
        'Failed to send WhatsApp message'
      );

      expect(whatsappClientMock.messages.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendTemplateWhatsapp', () => {
    it('should send a template WhatsApp message successfully', async () => {
      whatsappClientMock.messages.create.mockResolvedValue({});

      const variables = { name: 'Neider' };

      await service.sendTemplateWhatsapp('+1234567890', 'contentSid123', variables);

      expect(whatsappClientMock.messages.create).toHaveBeenCalledWith({
        to: 'whatsapp:+1234567890',
        from: 'whatsapp:+573203473708',
        contentSid: 'contentSid123',
        contentVariables: JSON.stringify(variables),
      });
      expect(whatsappClientMock.messages.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when sending template WhatsApp messages', async () => {
      whatsappClientMock.messages.create.mockRejectedValue(new Error('Failed to send template WhatsApp message'));

      await expect(
        service.sendTemplateWhatsapp('+1234567890', 'contentSid123', { name: 'Neider' })
      ).rejects.toThrow('Failed to send template WhatsApp message');

      expect(whatsappClientMock.messages.create).toHaveBeenCalledTimes(1);
    });
  });
});
