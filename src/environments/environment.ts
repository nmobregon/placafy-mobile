// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  shareBaseUrl: 'https://placafy.com',
  publicApiKey: 'pk_39f7d16a2bcb4f97a4e53e7a',
  /** Client Firebase config (public; used by Angular/Capacitor FCM). Not the server service account. */
  firebase: {
    apiKey: 'AIzaSyCt0uCraQPZPiyt1hNDsuP7NVxEJMvQSig',
    authDomain: 'placafy.firebaseapp.com',
    projectId: 'placafy',
    storageBucket: 'placafy.firebasestorage.app',
    messagingSenderId: '189254967486',
    appId: '1:189254967486:web:5f772b809a1c87519b3eef',
    webPushVapidKey: 'BHLUe2h43209o1x3PnOs1RROs3SDukQF5wR1_EDrOVqcmQFBpYZeR94-ITNC7r3GOqRC5Vur6VXjbtL3Jzct0bQ',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
