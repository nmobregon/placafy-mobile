# Placafy — Project Bible

## What is Placafy?
Placafy is a mobile-first anonymous messaging app that lets anyone send a message to the owner of a vehicle by entering their license plate number. Think of it as a "chat with a license plate" — you see a car double-parked, scratched, lights left on, or you just want to leave a nice note? Open Placafy, type the plate, write your message, done.

## Core Philosophy
- **Anonymous by default**: No login required to send or browse messages. Login is optional and only needed to "claim" a plate (subscribe to receive push notifications for your own plates).
- **Minimalism first**: The UI should feel instant. The send form is the hero — license plate input + message textarea + send button. Nothing else in the way.
- **Public feed**: All messages are public. The home page is a real-time feed of recent messages, filterable by license plate.

## Core Features (MVP)
1. **Send a Message** — Input a license plate + text message. No auth required. Anonymous by default, optional display name.
2. **Public Feed** — Scrollable feed of all recent messages, newest first. Each card shows: plate number, message preview, timestamp, sender name (or "Anonymous").
3. **Filter by Plate** — Search/filter the feed by a specific license plate to see all messages for that plate.
4. **Claim a Plate (optional login)** — Authenticated users can "subscribe" to a license plate to receive push notifications when someone messages it.

## Technical Stack
- **Frontend**: Ionic 8.8 + Angular 21 (standalone components) + Capacitor 8
- **Language**: TypeScript 5.9
- **State**: Angular signals where appropriate, services with BehaviorSubject for shared state
- **Routing**: Tab-based layout with 2 main tabs: Feed, Send Message. Optional profile tab for logged-in users.
- **Backend**: Mocked for now. All API calls go through service layer with mock data. Services are designed so swapping to real HTTP is a one-line change per method.
- **Styling**: Ionic components + custom SCSS. Dark mode supported via system preference.

## App Structure

### Tabs
1. **Feed Tab** (`/tabs/feed`) — Home page. Shows all messages in a card-based feed. Has a search bar at top to filter by plate number.
2. **Send Tab** (`/tabs/send`) — The hero feature. License plate input (styled prominently) + message textarea + send button. Confirmation toast on success.
3. **Profile Tab** (`/tabs/profile`) — Optional. Shows login/register for anonymous users, or plate subscriptions for logged-in users. Low priority for MVP.

### Data Models
```typescript
interface Message {
  id: string;
  plateNumber: string;       // e.g. "ABC-1234"
  text: string;
  senderName: string;        // "Anonymous" if not provided
  createdAt: Date;
}

interface PlateSubscription {
  id: string;
  userId: string;
  plateNumber: string;
  createdAt: Date;
}

interface User {
  id: string;
  email: string;
  createdAt: Date;
}
```

### Services
- `MessageService` — CRUD for messages. `getMessages()`, `getMessagesByPlate(plate)`, `sendMessage(plate, text, senderName?)`. Mocked with in-memory array + fake delay.
- `AuthService` — Optional login/register. `login()`, `register()`, `logout()`, `currentUser$`. Mocked.
- `SubscriptionService` — Plate claim/subscribe. `subscribe(plate)`, `getMySubscriptions()`, `unsubscribe(id)`. Mocked.

### Mock Data Strategy
All services use `signal()` or `BehaviorSubject` for state, with `setTimeout` to simulate network latency (300-800ms). Mock data is seeded with ~20 realistic messages across 8-10 different plates. This lets us build and polish the entire UI without any backend dependency.

## Design Decisions
- License plate input is always UPPERCASED and auto-formatted
- Messages are limited to 500 characters
- Feed uses infinite scroll (load 20 at a time)
- No edit/delete for messages (anonymous = permanent)
- Plate numbers displayed in a "badge" style (monospace, bordered, resembling actual plates)
- Send confirmation uses a toast, not a page redirect — keeps the flow fast
- Feed cards are tappable to see full message + all messages for that plate

## File Organization
```
src/app/
├── models/          # TypeScript interfaces
├── services/        # MessageService, AuthService, SubscriptionService
├── pages/
│   ├── feed/        # Feed tab - message list + filter
│   ├── send/        # Send tab - plate input + message form
│   ├── plate/       # Plate detail - all messages for one plate
│   └── profile/     # Profile tab - login/subscriptions
├── components/
│   ├── message-card/    # Reusable message card for feed
│   └── plate-badge/     # Styled license plate display
├── tabs/            # Tab layout shell
└── app.component.ts
```

## i18n (Internationalization)
- **Zero-dependency** — custom `I18nService` using Angular signals, no external packages
- Translation files live in `src/app/i18n/` (e.g. `en.ts`)
- All UI strings use `i18n.t('key')` with optional interpolation: `i18n.t('feed.noResults', { query: 'ABC' })`
- To add a new language: create `src/app/i18n/es.ts` (or any locale), export a matching key map, and call `i18n.setLocale('es')`
- Tab labels in `tabs.page.html` are still hardcoded (Ionic tab labels don't easily bind to signals) — these should be translated when adding a language switcher

## Country-Specific Plate Validation
- `PlateValidationService` in `src/app/services/plate-validation.service.ts`
- Each country has: `code`, `name`, `flag` (emoji), `plateRegex`, `placeholder`, `formatHint`
- 12 countries supported: US, MX, BR, AR, CO, CL, ES, DE, FR, GB, PT, IT
- Send page shows a country selector (action sheet with flag + name), flag badge next to plate input
- Validation strips dashes/spaces before regex matching — users can type freely
- Invalid plates show a red border + format hint below the input (only after field is touched)
- Send button is disabled until plate passes country-specific validation AND message is non-empty

## File Organization (Updated)
```
src/app/
├── models/              # TypeScript interfaces
├── services/
│   ├── message.service.ts        # MessageService (mock)
│   └── plate-validation.service.ts # Country rules + validation
├── i18n/
│   ├── i18n.service.ts           # Signal-based translation service
│   └── en.ts                     # English translations
├── utils/
│   └── time.utils.ts             # timeAgo() relative timestamps
├── pages/
│   ├── feed/        # Feed tab - message list + filter + FAB
│   ├── send/        # Send tab - country selector + plate input + form
│   ├── plate/       # Plate detail - all messages for one plate
│   └── profile/     # Profile tab - login placeholder
├── components/
│   ├── message-card/    # Reusable message card for feed
│   └── plate-badge/     # Styled license plate display
├── tabs/            # Tab layout shell
└── app.component.ts
```

## Future Features (Post-MVP)
- Push notifications via Firebase Cloud Messaging
- Image attachments
- Location tagging (show where the message was sent from)
- Plate number OCR via camera
- Message reactions (thumbs up/down)
- Additional languages (Spanish, Portuguese, etc.)
- Language switcher in profile/settings
