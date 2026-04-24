/* eslint-disable no-undef */
/**
 * Keep these URLs aligned with the `firebase` version in package.json (compat bundles).
 */
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.1/firebase-messaging-compat.js');

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyCt0uCraQPZPiyt1hNDsuP7NVxEJMvQSig',
    authDomain: 'placafy.firebaseapp.com',
    projectId: 'placafy',
    storageBucket: 'placafy.firebasestorage.app',
    messagingSenderId: '189254967486',
    appId: '1:189254967486:web:5f772b809a1c87519b3eef',
  });
}

const messaging = firebase.messaging();

const showFromPayload = (payload) => {
  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    'Placafy';
  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    '';
  const origin = self.location.origin;
  const options = {
    body,
    icon: `${origin}/assets/icon.png`,
    data: payload?.data || {},
  };
  return self.registration.showNotification(title, options);
};

if (typeof messaging.onBackgroundMessage === 'function') {
  messaging.onBackgroundMessage((payload) => {
    return showFromPayload(payload);
  });
} else if (typeof messaging.setBackgroundMessageHandler === 'function') {
  messaging.setBackgroundMessageHandler((payload) => {
    return showFromPayload(payload);
  });
}
