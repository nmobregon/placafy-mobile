import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonRefresher, IonRefresherContent, IonText,
  IonFab, IonFabButton, IonButtons, IonSelect, IonSelectOption,
} from '@ionic/angular/standalone';
import { MessageService } from '../../services/message.service';
import { MessageCardComponent } from '../../components/message-card/message-card.component';
import { I18nService, SupportedLocale } from '../../i18n/i18n.service';

@Component({
  selector: 'app-feed',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonRefresher, IonRefresherContent, IonText,
    IonFab, IonFabButton, IonButtons, IonSelect, IonSelectOption,
    MessageCardComponent,
  ],
  templateUrl: 'feed.page.html',
  styleUrls: ['feed.page.scss'],
})
export class FeedPage {
  private messageService = inject(MessageService);
  private router = inject(Router);
  protected i18n = inject(I18nService);
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  searchQuery = signal('');
  languageOptions: ReadonlyArray<{ value: SupportedLocale; label: string }> = [
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' },
    { value: 'fr', label: 'FR' },
    { value: 'de', label: 'DE' },
    { value: 'it', label: 'IT' },
    { value: 'pt', label: 'PT' },
  ];

  constructor() {
    void this.refreshAllMessages();
    this.startAutoRefresh();
  }

  ionViewWillEnter() {
    void this.refreshAllMessages();
    this.startAutoRefresh();
  }

  ionViewDidLeave() {
    this.stopAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  filteredMessages = computed(() => {
    const query = this.searchQuery();
    return query
      ? this.messageService.searchMessages(query)
      : this.messageService.messages();
  });

  onSearch(event: CustomEvent) {
    this.searchQuery.set((event.detail.value ?? '').trim());
  }

  onRefresh(event: CustomEvent) {
    void this.refreshAllMessages().finally(() => {
      (event.target as HTMLIonRefresherElement).complete();
    });
  }

  goToPlate(plateNumber: string) {
    this.router.navigate(['/plate', plateNumber]);
  }

  goToSend() {
    this.router.navigate(['/tabs/send']);
  }

  async onLanguageChange(event: CustomEvent) {
    await this.i18n.setLocale(event.detail.value as SupportedLocale);
  }

  private refreshAllMessages(): Promise<void> {
    return this.messageService.loadMessages();
  }

  private startAutoRefresh() {
    if (this.refreshIntervalId) {
      return;
    }

    this.refreshIntervalId = setInterval(() => {
      void this.refreshAllMessages();
    }, 10000);
  }

  private stopAutoRefresh() {
    if (!this.refreshIntervalId) {
      return;
    }

    clearInterval(this.refreshIntervalId);
    this.refreshIntervalId = null;
  }
}
