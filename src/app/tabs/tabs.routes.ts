import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'feed',
        loadComponent: () =>
          import('../pages/feed/feed.page').then((m) => m.FeedPage),
      },
      {
        path: 'send',
        loadComponent: () =>
          import('../pages/send/send.page').then((m) => m.SendPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/tabs/feed',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/feed',
    pathMatch: 'full',
  },
];
