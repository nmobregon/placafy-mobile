import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { initFirebaseAnalytics } from './services/firebase-init';
import { PushSubscriptionService } from './services/push-subscription.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    initFirebaseAnalytics();
    inject(PushSubscriptionService).initWebForegroundListener();
  }
}
