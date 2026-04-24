import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushSubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly headers = new HttpHeaders({
    'x-api-key': environment.publicApiKey,
  });
  private readonly tokenStorageKey = 'placafy:fcm-token';
  private readonly plateStatePrefix = 'placafy:plate-subscribed:';

  async subscribeToPlate(plateNumber: string): Promise<void> {
    const token = await this.getOrCreateDeviceToken();
    const normalizedPlate = plateNumber.trim().toUpperCase();

    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/push-subscriptions`,
        { plateNumber: normalizedPlate, fcmToken: token },
        { headers: this.headers },
      ),
    );

    localStorage.setItem(this.getPlateStateKey(normalizedPlate), '1');
  }

  async unsubscribeFromPlate(plateNumber: string): Promise<void> {
    const token = localStorage.getItem(this.tokenStorageKey)?.trim();
    if (!token) {
      localStorage.removeItem(this.getPlateStateKey(plateNumber));
      return;
    }

    const normalizedPlate = plateNumber.trim().toUpperCase();
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/push-subscriptions`, {
        headers: this.headers,
        body: { plateNumber: normalizedPlate, fcmToken: token },
      }),
    );

    localStorage.removeItem(this.getPlateStateKey(normalizedPlate));
  }

  isSubscribedLocally(plateNumber: string): boolean {
    const normalizedPlate = plateNumber.trim().toUpperCase();
    return localStorage.getItem(this.getPlateStateKey(normalizedPlate)) === '1';
  }

  private getPlateStateKey(plateNumber: string): string {
    return `${this.plateStatePrefix}${plateNumber.trim().toUpperCase()}`;
  }

  private async getOrCreateDeviceToken(): Promise<string> {
    const cached = localStorage.getItem(this.tokenStorageKey)?.trim();
    if (cached) {
      return cached;
    }

    if (!Capacitor.isNativePlatform()) {
      const webToken = await this.getOrCreateWebToken();
      localStorage.setItem(this.tokenStorageKey, webToken);
      return webToken;
    }

    const permission = await PushNotifications.requestPermissions();
    console.log('[push] Native permission result:', permission);
    if (permission.receive !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const token = await this.registerAndWaitToken();
    localStorage.setItem(this.tokenStorageKey, token);
    return token;
  }

  private async registerAndWaitToken(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        void registrationSub.remove();
        void errorSub.remove();
        reject(new Error('Timed out waiting for push token registration'));
      }, 10000);

      const registrationSub = await PushNotifications.addListener(
        'registration',
        (token: Token) => {
          console.log('[push] Registration success.');
          clearTimeout(timeoutId);
          void registrationSub.remove();
          void errorSub.remove();
          resolve(token.value);
        },
      );

      const errorSub = await PushNotifications.addListener(
        'registrationError',
        (error) => {
          console.error('[push] Registration error:', error);
          clearTimeout(timeoutId);
          void registrationSub.remove();
          void errorSub.remove();
          reject(new Error(error.error));
        },
      );

      console.log('[push] Calling PushNotifications.register()');
      await PushNotifications.register();
    });
  }

  private async requestBrowserPermission(): Promise<void> {
    if (typeof Notification === 'undefined') {
      throw new Error('Browser notifications are not supported on this platform.');
    }

    if (Notification.permission === 'granted') {
      console.log('[push] Browser permission already granted.');
      return;
    }

    const result = await Notification.requestPermission();
    console.log('[push] Browser permission result:', result);
    if (result !== 'granted') {
      throw new Error('Browser notification permission not granted.');
    }
  }

  private async getOrCreateWebToken(): Promise<string> {
    await this.requestBrowserPermission();

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Web push is not supported by this browser.');
    }

    const vapidKey = environment.firebase.webPushVapidKey?.trim();
    if (!vapidKey) {
      throw new Error('Missing web push VAPID key configuration.');
    }

    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    const messaging = getMessaging(app);
    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const serviceWorkerRegistration = await this.waitForActiveServiceWorker();
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      throw new Error('Unable to generate web push token.');
    }

    console.log('[push] Web token generated.');
    return token;
  }

  private async waitForActiveServiceWorker(): Promise<ServiceWorkerRegistration> {
    const readyRegistration = await navigator.serviceWorker.ready;
    if (readyRegistration.active) {
      return readyRegistration;
    }

    const fallbackRegistration = await navigator.serviceWorker.getRegistration(
      '/firebase-messaging-sw.js',
    );
    if (fallbackRegistration?.active) {
      return fallbackRegistration;
    }

    throw new Error('Service worker is not active yet. Reload and try again.');
  }
}
