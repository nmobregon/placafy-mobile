import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Message, SendMessageData } from '../models/message.model';
import { environment } from '../../environments/environment';
import { I18nService } from '../i18n/i18n.service';

const normalizePlateForCompare = (value: string): string =>
  value.replace(/[^a-z0-9]/gi, '').toUpperCase().trim();

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly headers = new HttpHeaders({
    'x-api-key': environment.publicApiKey,
  });
  private _messages = signal<Message[]>([]);

  readonly messages = computed(() =>
    this._messages().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );

  constructor() {
    void this.loadMessages();
  }

  async loadMessages(plateNumber?: string): Promise<void> {
    const endpoint = plateNumber
      ? `${this.baseUrl}/messages/plate/${encodeURIComponent(plateNumber)}`
      : `${this.baseUrl}/messages`;

    const response = await firstValueFrom(
      this.http.get<{ items: ApiMessage[] }>(endpoint, { headers: this.headers }),
    );
    this._messages.set(response.items.map(mapApiMessage));
  }

  getMessagesByPlate(plateNumber: string): Message[] {
    const normalized = normalizePlateForCompare(plateNumber);
    return this.messages().filter(
      m => normalizePlateForCompare(m.plateNumber) === normalized
    );
  }

  searchMessages(query: string): Message[] {
    if (!query || !query.trim()) return this.messages();
    const normalized = normalizePlateForCompare(query);
    return this.messages().filter(m =>
      normalizePlateForCompare(m.plateNumber).includes(normalized)
    );
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    const created = await firstValueFrom(
      this.http.post<ApiMessage>(
        `${this.baseUrl}/messages`,
        {
          plateNumber: data.plateNumber,
          text: data.text,
          senderName: data.senderName,
        },
        { headers: this.headers },
      ),
    );
    const message = mapApiMessage(created);
    this._messages.update((msgs) => [message, ...msgs]);
    return message;
  }

  async getRecommendedMessages(limit = 4): Promise<string[]> {
    // Mock API call. Replace with real HTTP request later.
    await new Promise(resolve => setTimeout(resolve, 300));
    const max = Math.max(1, limit);
    const localizedMessages = [
      this.i18n.t('send.recommendedExample1'),
      this.i18n.t('send.recommendedExample2'),
      this.i18n.t('send.recommendedExample3'),
      this.i18n.t('send.recommendedExample4'),
      this.i18n.t('send.recommendedExample5'),
      this.i18n.t('send.recommendedExample6'),
    ];
    return localizedMessages.slice(0, max);
  }
}

type ApiMessage = {
  id: string;
  plateNumber: string;
  text: string;
  senderName: string;
  geoOrigin?: string | null;
  createdAt: string;
};

const mapApiMessage = (message: ApiMessage): Message => ({
  ...message,
  createdAt: new Date(message.createdAt),
});
