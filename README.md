# Lightbot

A Lightbot-style puzzle game where players program a robot using drag-and-drop commands (or Spanish text input) to navigate a grid, toggle lights, and solve logic challenges.

The project is a **monorepo** with three parts: the web game (frontend), the REST API (backend), and the mobile app (native wrapper).

---

## Monorepo Structure

```
lightbot/
├── src/                  # Frontend — React + Phaser 3 (web game)
├── lightbotAPI/          # Backend  — AdonisJS REST API
├── mobile/               # Mobile   — Expo + React Native (WebView wrapper)
├── public/               # Frontend static assets
├── dist/                 # Frontend production build
└── package.json          # Frontend dependencies
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Phaser 3, Zustand, Tailwind CSS, @dnd-kit |
| **Backend** | AdonisJS 7, Lucid ORM, VineJS, Access Tokens (Bearer), Nodemailer |
| **Mobile** | Expo 52, React Native 0.76, Expo Router, React Native WebView |
| **Database** | PostgreSQL |

---

## Installation & Setup

### Frontend (web game)

```bash
# From the project root
npm install
npm run dev        # → http://localhost:3000
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
```

### Backend (API)

```bash
cd lightbotAPI
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DB, SMTP credentials, etc.

# Run migrations
node ace migration:run

# Start dev server
npm run dev        # → http://localhost:3333
```

### Mobile (native app)

```bash
cd mobile
npm install
npx expo start          # Start Expo dev server
npx expo run:android    # Run on Android (requires emulator or device)
npx expo run:ios        # Run on iOS (macOS only)
```

> The mobile app loads the web game inside a WebView. In development it points to `localhost:3000` (or `10.0.2.2:3000` on Android emulator). In production it points to the URL configured in `mobile/src/config.ts`.

---

## Frontend Architecture

```
src/
├── components/
│   ├── Game/
│   │   ├── GameWrapper.tsx        # Mounts/destroys Phaser in a div
│   │   ├── InstructionPanel.tsx   # Command palette + drag-and-drop queue
│   │   └── LevelHUD.tsx           # Level name, step counter
│   ├── AuthScreen.tsx             # Login/signup screen
│   ├── EmailVerificationScreen.tsx
│   ├── EmailVerifiedScreen.tsx
│   ├── LevelSelectScreen.tsx      # World map with level nodes
│   ├── SettingsScreen.tsx         # Audio settings and preferences
│   ├── TutorProfileScreen.tsx     # Authenticated tutor profile
│   └── UserSelectScreen.tsx       # Student selection/creation
├── context/
│   ├── AuthContext.tsx             # Global auth state (tutor + token)
│   └── UserContext.tsx             # Global active student state
├── game/
│   ├── PhaserGame.ts              # Phaser.Game factory (injects bridge into registry)
│   ├── scenes/
│   │   ├── BootScene.ts           # Generates procedural assets → transitions to GameScene
│   │   └── GameScene.ts           # Grid rendering, command dispatch, victory detection
│   ├── entities/
│   │   └── Robot.ts               # Robot sprite + move/turn/toggleLight/copyVar methods
│   ├── levels/
│   │   ├── LevelManager.ts        # Catalogue of 40 levels across 4 worlds
│   │   └── level1.ts … level40.ts # Individual level definitions
│   ├── logic/
│   │   ├── CommandExecutor.ts     # Sequential executor with LOOP_UNTIL_PLANT support
│   │   ├── commands.ts            # Command enum + metadata (icons, colors)
│   │   └── textCommandParser.ts   # Spanish text command parser
│   ├── audio/
│   │   └── SoundManager.ts        # Procedural Web Audio API (background music + SFX)
│   └── constants/
│       └── gameConfig.ts          # Canvas size (680x560), cell size (64px), timing, colors
├── hooks/
│   └── useGameBridge.ts           # Shared React <-> Phaser EventEmitter
├── services/
│   └── service.ts                 # HTTP client for the API (auth, users, profile)
├── store/
│   └── gameStore.ts               # Zustand store (command queue, execution, attempts)
└── types/
    └── game.types.ts              # Shared types: Command, CellType, Direction, LevelDef…
```

### React <-> Phaser Communication

All cross-boundary communication goes through a shared **`Phaser.Events.EventEmitter`** — no direct DOM access.

```
React  ──emit──►  run-commands, reset-level, load-level, set-mute, set-volume
Phaser ──emit──►  level-loaded, level-complete, robot-moved, command-executed, command-failed
```

The emitter is created in `useGameBridge`, passed as a prop to `GameWrapper`, and stored in `game.registry` so any Phaser scene can access it via `this.registry.get('bridge')`.

---

## Backend Architecture

```
lightbotAPI/
├── app/
│   ├── controllers/
│   │   ├── access_token_controller.ts     # Login (create token) and logout
│   │   ├── new_account_controller.ts      # Tutor registration
│   │   ├── email_verification_controller.ts # Verify/resend email
│   │   ├── profile_controller.ts          # Authenticated tutor profile
│   │   └── users_controller.ts            # Student CRUD for the tutor
│   ├── models/
│   │   ├── tutors.ts                      # Tutor model (auth + 1:N users relation)
│   │   └── user.ts                        # User/Student model (N:1 tutor relation)
│   ├── validators/                        # VineJS request validation
│   ├── transformers/                      # Filter sensitive fields from responses
│   ├── middleware/                         # Auth, ForceJSON, SilentAuth, ContainerBindings
│   ├── services/
│   │   └── email_verification_service.ts  # Nodemailer: token generation + HTML emails
│   └── exceptions/
├── database/
│   ├── schema.ts                          # Auto-generated schemas (do not edit)
│   └── migrations/                        # Table creation and email verification columns
├── start/
│   ├── routes.ts                          # Route definitions under /api/v1
│   ├── kernel.ts                          # Middleware registration
│   ├── env.ts                             # Environment variable validation
│   └── validator.ts                       # Global transform: Date → Luxon DateTime
├── config/
│   └── auth.ts                            # Guards: api (tokens) and web (sessions)
└── providers/
    └── api_provider.ts                    # Serializer wrapping responses in { data: ... }
```

### API Endpoints

All prefixed with `/api/v1`:

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/signup` | No | Register new tutor |
| `POST` | `/auth/login` | No | Log in (returns Bearer token) |
| `POST` | `/auth/logout` | Yes | Log out (deletes token) |
| `GET` | `/auth/verify-email?token=...` | No | Verify email (redirects to frontend) |
| `POST` | `/auth/resend-verification` | No | Resend verification email |
| `GET` | `/account/profile` | Yes | Get tutor profile |
| `GET` | `/users` | Yes | List tutor's students |
| `POST` | `/users` | Yes | Create student |
| `GET` | `/users/:id` | Yes | Get student by ID |
| `PUT` | `/users/:id` | Yes | Update student |
| `DELETE` | `/users/:id` | Yes | Delete student |

### Authentication Flow

1. **Signup** → `POST /auth/signup` creates the tutor and sends a verification email with a token
2. **Verification** → Tutor clicks the email link → `GET /auth/verify-email?token=...`
3. **Login** → `POST /auth/login` validates credentials + verified email → returns Bearer token (30 days)
4. **Authenticated requests** → Header `Authorization: Bearer <token>`

---

## Mobile Architecture

```
mobile/
├── app/
│   ├── _layout.tsx      # Root Expo Router layout (Stack without header)
│   └── index.tsx         # Home screen → renders WebViewGame
├── src/
│   ├── config.ts         # Game URL (dev: localhost / prod: domain)
│   └── WebViewGame.tsx   # Fullscreen WebView + immersive mode + Android back button
└── android/              # Native Android project (generated by Expo prebuild)
```

The mobile app is a **WebView wrapper** that loads the web game as-is inside React Native. This allows maintaining a single game codebase for both web and mobile.

---

## Level System

The game has **40 levels** organized into **4 worlds**:

| World | Name | Levels | Mechanics |
|-------|------|--------|-----------|
| 1 | Land of Lights | 1–10 | Basic movement, turns, toggling lights |
| 2 | Code Islands | 11–20 | Loops (`LOOP_UNTIL_PLANT`), plants |
| 3 | Robot Galaxy | 21–30 | Color variables, `COPY_VAR` |
| 4 | Digital Volcano | 31–40 | Combination of all mechanics |

### Victory Conditions (checked in order)
1. Variable colors match their targets
2. Robot reaches the plant
3. All lights are toggled on

### Cell Types
`floor`, `light`, `wall`, `plant`, `variable`, `empty`

### Available Commands
`MOVE_FORWARD`, `TURN_LEFT`, `TURN_RIGHT`, `LIGHT_TOGGLE`, `LOOP_UNTIL_PLANT`, `COPY_VAR`

---

## How to Play

1. Select commands from the palette (click or drag) to build the instruction queue
2. Press **Execute** — the robot follows your instructions step by step
3. Toggle all lights on or fulfill the level's victory condition
4. Press **Reset** at any time to restart
5. In levels with text mode, type commands in Spanish (e.g., "avanzar", "girar izquierda", "luz")

---

## Adding a New Level

1. Create `src/game/levels/levelN.ts`:

```ts
import { LevelDef, Direction } from '../../types/game.types'

const levelN: LevelDef = {
  id: N,
  name: 'Level Name',
  maxCommands: 10,
  maxAttempts: 5,
  robotStart: { row: 0, col: 0, direction: Direction.RIGHT },
  allowedCommands: ['MOVE_FORWARD', 'TURN_LEFT', 'TURN_RIGHT', 'LIGHT_TOGGLE'],
  grid: [
    [{ type: 'floor' }, { type: 'light' }, { type: 'floor' }],
    [{ type: 'floor' }, { type: 'floor' }, { type: 'light' }],
  ],
}

export default levelN
```

2. Register it in `LevelManager.ts` by importing and adding it to the `LEVELS` array
3. Update the corresponding world in `LevelSelectScreen.tsx`

---

## Adding a New Command

1. Add the enum value to `Command` in `game.types.ts`
2. Add metadata to `COMMAND_META` in `commands.ts`
3. Handle the case in `GameScene.applyCommand()`
4. Add the action method on `Robot` if needed
5. Add Spanish aliases in `textCommandParser.ts`

---

## Video Demo

https://www.youtube.com/watch?v=hRU5l6_9YFM&feature=youtu.be

https://www.youtube.com/watch?v=g48ZjmoUptY

## License

MIT

## Author

albertoportfolio
