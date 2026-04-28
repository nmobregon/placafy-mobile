import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { environment } from '../../environments/environment';

type SharePayload = {
  title: string;
  description: string;
  url: string;
};

@Injectable({ providedIn: 'root' })
export class SocialShareService {
  private readonly shareBaseUrl = environment.shareBaseUrl;
  private readonly logoUrl = `${this.shareBaseUrl}/assets/logo.png`;

  appUrl(): string {
    return this.shareBaseUrl;
  }

  plateUrl(plateNumber: string): string {
    return `${this.shareBaseUrl}/plate/${encodeURIComponent(plateNumber)}`;
  }

  messageUrl(plateNumber: string, messageId: string): string {
    return `${this.plateUrl(plateNumber)}?message=${encodeURIComponent(messageId)}`;
  }

  async share(payload: SharePayload): Promise<void> {
    const text = `${payload.description}\n${this.logoUrl}`;

    try {
      await Share.share({
        title: payload.title,
        text,
        url: payload.url,
        dialogTitle: payload.title,
      });
      return;
    } catch (error) {
      console.warn('[share] Capacitor Share failed, falling back:', error);
    }

    if (navigator.share) {
      await navigator.share({
        title: payload.title,
        text,
        url: payload.url,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(`${payload.title}\n${payload.description}\n${payload.url}\n${this.logoUrl}`);
    } catch (error) {
      console.warn('[share] Clipboard fallback failed:', error);
      window.open(payload.url, '_blank', 'noopener,noreferrer');
    }
  }
}
