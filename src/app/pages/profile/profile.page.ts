import { Component, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonText, IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline } from 'ionicons/icons';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-profile',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonText, IonButtons,
  ],
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage {
  protected i18n = inject(I18nService);

  constructor() {
    addIcons({ shieldCheckmarkOutline });
  }
}
