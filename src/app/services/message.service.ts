import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Message, SendMessageData } from '../models/message.model';
import { environment } from '../../environments/environment';

const normalizePlateForCompare = (value: string): string =>
  value.replace(/[^a-z0-9]/gi, '').toUpperCase().trim();

const MOCK_RECOMMENDED_MESSAGES: string[] = [
  'Your headlights are on.',
  'You are blocking my driveway, please move when possible.',
  'Your tire looks flat.',
  'You left your window open and rain is coming.',
  'Thanks for parking properly.',
  'Your alarm has been going off for a while.',
];

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);
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
    return MOCK_RECOMMENDED_MESSAGES.slice(0, Math.max(1, limit));
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
