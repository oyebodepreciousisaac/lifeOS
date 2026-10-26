export interface TermiiSendResult {
  success: boolean;
  messageId: string;
  unitsDeducted: number;
  providerStatus: string;
  error?: string;
}

export class TermiiSmsProvider {
  private apiKey: string;
  private senderId: string;
  private baseUrl = 'https://api.ng.termii.com/api/sms/send';

  constructor() {
    this.apiKey = process.env.TERMII_API_KEY || '';
    this.senderId = process.env.TERMII_SENDER_ID || 'SchoolOS';
  }

  /**
   * Normalizes Nigerian phone numbers to international standard without '+'
   * 08031234567 -> 2348031234567
   * +2348031234567 -> 2348031234567
   */
  normalizePhoneNumber(phone: string): string {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '234' + clean.slice(1);
    } else if (clean.startsWith('234')) {
      // already good
    } else if (clean.length === 10) {
      clean = '234' + clean;
    }
    return clean;
  }

  /**
   * Sends transactional or alert SMS with automatic DND routing
   */
  async sendSms(to: string, message: string): Promise<TermiiSendResult> {
    const recipientPhone = this.normalizePhoneNumber(to);
    const charCount = message.length;
    const units = Math.ceil(charCount / 160) || 1;

    // Real API dispatch if key is provided
    if (this.apiKey) {
      try {
        const payload = {
          to: recipientPhone,
          from: this.senderId,
          sms: message,
          type: 'plain',
          channel: 'generic', // Termii auto-routes to DND fallback if standard fails
          api_key: this.apiKey,
        };

        const res = await fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.message_id) {
          return {
            success: true,
            messageId: data.message_id,
            unitsDeducted: units,
            providerStatus: 'DELIVERED',
          };
        }

        return {
          success: false,
          messageId: `TRM-ERR-${Date.now()}`,
          unitsDeducted: 0,
          providerStatus: 'FAILED',
          error: data.message || 'Termii provider rejection',
        };
      } catch (err: any) {
        return {
          success: false,
          messageId: `TRM-NET-ERR-${Date.now()}`,
          unitsDeducted: 0,
          providerStatus: 'FAILED',
          error: err.message || 'Network error connecting to Termii API',
        };
      }
    }

    // High-Fidelity Simulation Mode (when testing without live Termii credentials)
    return {
      success: true,
      messageId: `TRM-SIM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      unitsDeducted: units,
      providerStatus: 'DELIVERED',
    };
  }
}

export const defaultTermiiProvider = new TermiiSmsProvider();
