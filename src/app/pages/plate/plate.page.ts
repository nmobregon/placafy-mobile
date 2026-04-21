import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonBackButton, IonButtons, IonFab, IonFabButton, IonText,
} from '@ionic/angular/standalone';
import { MessageService } from '../../services/message.service';
import { MessageCardComponent } from '../../components/message-card/message-card.component';
import { PlateBadgeComponent } from '../../components/plate-badge/plate-badge.component';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-plate',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonBackButton, IonButtons, IonFab, IonFabButton, IonText,
    MessageCardComponent, PlateBadgeComponent,
  ],
  templateUrl: 'plate.page.html',
  styleUrls: ['plate.page.scss'],
})
export class PlatePage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  protected i18n = inject(I18nService);

  plateNumber = toSignal(
    this.route.paramMap.pipe(map(params => params.get('plateNumber') ?? '')),
    { initialValue: '' }
  );

  plateMessages = computed(() =>
    this.messageService.getMessagesByPlate(this.plateNumber())
  );

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const plateNumber = params.get('plateNumber') ?? '';
      void this.messageService.loadMessages(plateNumber);
    });
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
}
