import { Component, input, output, computed, inject } from '@angular/core';
import { IonCard, IonCardContent, IonNote, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shareSocialOutline } from 'ionicons/icons';
import { Message } from '../../models/message.model';
import { PlateBadgeComponent } from '../plate-badge/plate-badge.component';
import { timeAgo } from '../../utils/time.utils';
import { I18nService } from '../../i18n/i18n.service';
import { SocialShareService } from '../../services/social-share.service';

@Component({
  selector: 'app-message-card',
  imports: [IonCard, IonCardContent, IonNote, IonButton, IonIcon, PlateBadgeComponent],
  templateUrl: './message-card.component.html',
  styleUrls: ['./message-card.component.scss'],
})
export class MessageCardComponent {
  protected i18n = inject(I18nService);
  private socialShare = inject(SocialShareService);
  message = input.required<Message>();
  showPlate = input<boolean>(true);
  plateTapped = output<string>();

  relativeTime = computed(() => timeAgo(this.message().createdAt));

  onPlateTap(event: Event) {
    event.stopPropagation();
    this.plateTapped.emit(this.message().plateNumber);
  }

  constructor() {
    addIcons({ shareSocialOutline });
  }

  async shareMessage(event: Event) {
    event.stopPropagation();
    const message = this.message();
    await this.socialShare.share({
      title: this.i18n.t('share.messageTitle', { plate: message.plateNumber }),
      description: this.i18n.t('share.messageDescription', { message: message.text }),
      url: this.socialShare.messageUrl(message.plateNumber, message.id),
    });
  }
}
