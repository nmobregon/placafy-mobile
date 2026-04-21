import { Component, input, output, computed } from '@angular/core';
import { IonCard, IonCardContent, IonNote } from '@ionic/angular/standalone';
import { Message } from '../../models/message.model';
import { PlateBadgeComponent } from '../plate-badge/plate-badge.component';
import { timeAgo } from '../../utils/time.utils';

@Component({
  selector: 'app-message-card',
  imports: [IonCard, IonCardContent, IonNote, PlateBadgeComponent],
  templateUrl: './message-card.component.html',
  styleUrls: ['./message-card.component.scss'],
})
export class MessageCardComponent {
  message = input.required<Message>();
  showPlate = input<boolean>(true);
  plateTapped = output<string>();

  relativeTime = computed(() => timeAgo(this.message().createdAt));

  onPlateTap(event: Event) {
    event.stopPropagation();
    this.plateTapped.emit(this.message().plateNumber);
  }
}
