import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonRefresher, IonRefresherContent, IonText,
  IonFab, IonFabButton, IonSelect, IonSelectOption,
} from '@ionic/angular/standalone';
import { MessageService } from '../../services/message.service';
import { MessageCardComponent } from '../../components/message-card/message-card.component';
import { I18nService, SupportedLocale } from '../../i18n/i18n.service';

@Component({
  selector: 'app-feed',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonRefresher, IonRefresherContent, IonText,
    IonFab, IonFabButton, IonSelect, IonSelectOption,
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
  languageOptions: ReadonlyArray<{ value: SupportedLocale; flag: string; label: string }> = [
    { value: 'en', flag: '🇺🇸', label: 'English' },
    { value: 'es', flag: '🇪🇸', label: 'Español' },
    { value: 'fr', flag: '🇫🇷', label: 'Français' },
    { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
    { value: 'it', flag: '🇮🇹', label: 'Italiano' },
    { value: 'pt', flag: '🇵🇹', label: 'Português' },
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

  selectedLanguageFlag(): string {
    const locale = this.i18n.locale();
    const selected = this.languageOptions.find(option => option.value === locale);
    return selected?.flag ?? '🌐';
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
