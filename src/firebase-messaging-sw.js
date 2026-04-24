/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCt0uCraQPZPiyt1hNDsuP7NVxEJMvQSig',
  authDomain: 'placafy.firebaseapp.com',
  projectId: 'placafy',
  storageBucket: 'placafy.firebasestorage.app',
  messagingSenderId: '189254967486',
  appId: '1:189254967486:web:5f772b809a1c87519b3eef',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || 'Placafy';
  const options = {
    body: payload?.notification?.body || '',
    icon: '/assets/icon/icon-192.webp',
    data: payload?.data || {},
  };
  self.registration.showNotification(title, options);
});
