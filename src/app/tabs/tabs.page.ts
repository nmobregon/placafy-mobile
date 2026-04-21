import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, chatbubbleEllipsesOutline, personOutline } from 'ionicons/icons';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  protected i18n = inject(I18nService);

  constructor() {
    addIcons({ homeOutline, chatbubbleEllipsesOutline, personOutline });
  }
}
