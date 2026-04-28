import { Capacitor } from '@capacitor/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { environment } from '../../environments/environment';

let analyticsInitialized = false;

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(environment.firebase);
}

export function initFirebaseAnalytics(): void {
  if (analyticsInitialized) {
    return;
  }
  if (Capacitor.isNativePlatform()) {
    return;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (!environment.firebase.measurementId) {
    return;
  }

  analyticsInitialized = true;
  void isSupported()
    .then((supported) => {
      if (!supported) {
        return;
      }
      const app = getFirebaseApp();
      getAnalytics(app);
    })
    .catch(() => {
      analyticsInitialized = false;
    });
}
