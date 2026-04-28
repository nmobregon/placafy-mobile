import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonBackButton, IonButtons, IonFab, IonFabButton, IonText, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, notificationsOutline, shareSocialOutline } from 'ionicons/icons';
import { MessageService } from '../../services/message.service';
import { MessageCardComponent } from '../../components/message-card/message-card.component';
import { PlateBadgeComponent } from '../../components/plate-badge/plate-badge.component';
import { I18nService } from '../../i18n/i18n.service';
import { PushSubscriptionService } from '../../services/push-subscription.service';
import { SocialShareService } from '../../services/social-share.service';

@Component({
  selector: 'app-plate',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonBackButton, IonButtons, IonFab, IonFabButton, IonText, IonButton, IonIcon,
    MessageCardComponent, PlateBadgeComponent,
  ],
  templateUrl: 'plate.page.html',
  styleUrls: ['plate.page.scss'],
})
export class PlatePage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private pushSubscriptionService = inject(PushSubscriptionService);
  private socialShare = inject(SocialShareService);
  protected i18n = inject(I18nService);
  private routeSubscription: Subscription | null = null;
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
  isPushSubscribed = signal(false);
  isSubscriptionBusy = signal(false);
  subscriptionError = signal('');

  plateNumber = toSignal(
    this.route.paramMap.pipe(map(params => params.get('plateNumber') ?? '')),
    { initialValue: '' }
  );

  plateMessages = computed(() =>
    this.messageService.getMessagesByPlate(this.plateNumber())
  );

  constructor() {
    addIcons({ notificationsOutline, addOutline, closeOutline, shareSocialOutline });
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const plateNumber = params.get('plateNumber') ?? '';
      void this.messageService.loadMessages(plateNumber);
      this.isPushSubscribed.set(
        this.pushSubscriptionService.isSubscribedLocally(plateNumber),
      );
    });

    this.startAutoRefresh();
  }

  ionViewWillEnter() {
    this.startAutoRefresh();
  }

  ionViewDidLeave() {
    this.stopAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
    this.routeSubscription?.unsubscribe();
    this.routeSubscription = null;
  }

  sendToPlate() {
    // Navigate to send tab — plate pre-fill will be a future enhancement
    this.router.navigate(['/tabs/send']);
  }

  goToPlate(plateNumber: string) {
    this.router.navigate(['/plate', plateNumber]);
  }

  goToProfile() {
    this.router.navigate(['/tabs/profile']);
  }

  async togglePushSubscription(): Promise<void> {
    if (this.isSubscriptionBusy()) {
      return;
    }

    const plate = this.plateNumber();
    if (!plate) {
      return;
    }

    this.subscriptionError.set('');
    this.isSubscriptionBusy.set(true);
    try {
      if (this.isPushSubscribed()) {
        await this.pushSubscriptionService.unsubscribeFromPlate(plate);
        this.isPushSubscribed.set(false);
      } else {
        await this.pushSubscriptionService.subscribeToPlate(plate);
        this.isPushSubscribed.set(true);
      }
    } catch (error) {
      console.error('[push] togglePushSubscription failed:', error);
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : 'Unable to update notification subscription.';
      this.subscriptionError.set(message);
    } finally {
      this.isSubscriptionBusy.set(false);
    }
  }

  async sharePlate() {
    const plate = this.plateNumber();
    if (!plate) {
      return;
    }

    await this.socialShare.share({
      title: this.i18n.t('share.plateTitle', { plate }),
      description: this.i18n.t('share.plateDescription', { plate }),
      url: this.socialShare.plateUrl(plate),
    });
  }

  private startAutoRefresh() {
    if (this.refreshIntervalId) {
      return;
    }

    this.refreshIntervalId = setInterval(() => {
      void this.messageService.loadMessages(this.plateNumber());
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
