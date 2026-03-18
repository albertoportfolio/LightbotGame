# Lightbot

Juego de puzzles estilo Lightbot donde los jugadores programan un robot mediante comandos de arrastrar y soltar (o entrada de texto en español) para navegar por una cuadrícula, encender luces y resolver desafíos lógicos.

El proyecto es un **monorepo** con tres partes: el juego web (frontend), la API REST (backend) y la app móvil (wrapper nativo).

---

## Estructura del monorepo

```
lightbot/
├── src/                  # Frontend — React + Phaser 3 (juego web)
├── lightbotAPI/          # Backend  — AdonisJS REST API
├── mobile/               # Mobile   — Expo + React Native (WebView wrapper)
├── public/               # Assets estáticos del frontend
├── dist/                 # Build de producción del frontend
└── package.json          # Dependencias del frontend
```

---

## Tech Stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Phaser 3, Zustand, Tailwind CSS, @dnd-kit |
| **Backend** | AdonisJS 7, Lucid ORM, VineJS, Access Tokens (Bearer), Nodemailer |
| **Mobile** | Expo 52, React Native 0.76, Expo Router, React Native WebView |
| **Base de datos** | PostgreSQL 

---

## Instalación y ejecución

### Frontend (juego web)

```bash
# Desde la raíz del proyecto
npm install
npm run dev        # → http://localhost:3000
npm run build      # TypeScript check + build de producción
npm run preview    # Previsualizar build
```

### Backend (API)

```bash
cd lightbotAPI
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los datos de tu BD, SMTP, etc.

# Ejecutar migraciones
node ace migration:run

# Iniciar servidor de desarrollo
npm run dev        # → http://localhost:3333
```

### Mobile (app nativa)

```bash
cd mobile
npm install
npx expo start          # Inicia Expo dev server
npx expo run:android    # Ejecuta en Android (requiere emulador o dispositivo)
npx expo run:ios        # Ejecuta en iOS (solo macOS)
```

> La app móvil carga el juego web dentro de un WebView. En desarrollo apunta a `localhost:3000` (o `10.0.2.2:3000` en emulador Android). En producción apunta a la URL configurada en `mobile/src/config.ts`.

---

## Arquitectura del Frontend

```
src/
├── components/
│   ├── Game/
│   │   ├── GameWrapper.tsx        # Monta/destruye Phaser en un div
│   │   ├── InstructionPanel.tsx   # Paleta de comandos + cola drag-and-drop
│   │   └── LevelHUD.tsx           # Nombre del nivel, contador de pasos
│   ├── AuthScreen.tsx             # Pantalla de login/registro
│   ├── EmailVerificationScreen.tsx
│   ├── EmailVerifiedScreen.tsx
│   ├── LevelSelectScreen.tsx      # Mapa de mundos con nodos de niveles
│   ├── SettingsScreen.tsx         # Ajustes de audio y preferencias
│   ├── TutorProfileScreen.tsx     # Perfil del tutor autenticado
│   └── UserSelectScreen.tsx       # Selección/creación de alumnos
├── context/
│   ├── AuthContext.tsx             # Estado global de autenticación (tutor + token)
│   └── UserContext.tsx             # Estado global del usuario/alumno activo
├── game/
│   ├── PhaserGame.ts              # Factory de Phaser.Game (inyecta bridge en registry)
│   ├── scenes/
│   │   ├── BootScene.ts           # Genera assets procedurales → transición a GameScene
│   │   └── GameScene.ts           # Renderizado de cuadrícula, despacho de comandos, detección de victoria
│   ├── entities/
│   │   └── Robot.ts               # Sprite del robot + métodos move/turn/toggleLight/copyVar
│   ├── levels/
│   │   ├── LevelManager.ts        # Catálogo de 40 niveles en 4 mundos
│   │   └── level1.ts … level40.ts # Definiciones individuales de cada nivel
│   ├── logic/
│   │   ├── CommandExecutor.ts     # Ejecutor secuencial con soporte LOOP_UNTIL_PLANT
│   │   ├── commands.ts            # Enum Command + metadatos (iconos, colores)
│   │   └── textCommandParser.ts   # Parser de comandos en texto español
│   ├── audio/
│   │   └── SoundManager.ts        # Audio procedural Web Audio API (música + SFX)
│   └── constants/
│       └── gameConfig.ts          # Tamaño canvas (680×560), celdas (64px), timing, colores
├── hooks/
│   └── useGameBridge.ts           # EventEmitter compartido React ↔ Phaser
├── services/
│   └── service.ts                 # Cliente HTTP para la API (auth, users, profile)
├── store/
│   └── gameStore.ts               # Zustand store (cola de comandos, ejecución, intentos)
└── types/
    └── game.types.ts              # Tipos compartidos: Command, CellType, Direction, LevelDef…
```

### Comunicación React ↔ Phaser

Toda la comunicación entre React y Phaser pasa por un **`Phaser.Events.EventEmitter`** compartido — sin acceso directo al DOM.

```
React  ──emit──►  run-commands, reset-level, load-level, set-mute, set-volume
Phaser ──emit──►  level-loaded, level-complete, robot-moved, command-executed, command-failed
```

El emitter se crea en `useGameBridge`, se pasa como prop a `GameWrapper` y se almacena en `game.registry` para que cualquier escena Phaser lo acceda con `this.registry.get('bridge')`.

---

## Arquitectura del Backend

```
lightbotAPI/
├── app/
│   ├── controllers/
│   │   ├── access_token_controller.ts     # Login (crear token) y logout
│   │   ├── new_account_controller.ts      # Registro de tutores
│   │   ├── email_verification_controller.ts # Verificar/reenviar email
│   │   ├── profile_controller.ts          # Perfil del tutor autenticado
│   │   └── users_controller.ts            # CRUD de alumnos del tutor
│   ├── models/
│   │   ├── tutors.ts                      # Modelo Tutor (auth + relación 1:N users)
│   │   └── user.ts                        # Modelo User/Alumno (relación N:1 tutor)
│   ├── validators/                        # Validación con VineJS
│   ├── transformers/                      # Filtran campos sensibles en respuestas
│   ├── middleware/                         # Auth, ForceJSON, SilentAuth, ContainerBindings
│   ├── services/
│   │   └── email_verification_service.ts  # Nodemailer: genera tokens y envía emails HTML
│   └── exceptions/
├── database/
│   ├── schema.ts                          # Esquemas auto-generados (no editar)
│   └── migrations/                        # Creación de tablas y verificación de email
├── start/
│   ├── routes.ts                          # Definición de rutas /api/v1
│   ├── kernel.ts                          # Registro de middleware
│   ├── env.ts                             # Validación de variables de entorno
│   └── validator.ts                       # Transform global Date → Luxon DateTime
├── config/
│   └── auth.ts                            # Guards: api (tokens) y web (sesiones)
└── providers/
    └── api_provider.ts                    # Serializer que envuelve respuestas en { data: ... }
```

### Endpoints de la API

Todos bajo el prefijo `/api/v1`:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | No | Registrar nuevo tutor |
| `POST` | `/auth/login` | No | Iniciar sesión (devuelve Bearer token) |
| `POST` | `/auth/logout` | Si | Cerrar sesión (elimina token) |
| `GET` | `/auth/verify-email?token=...` | No | Verificar email (redirige al frontend) |
| `POST` | `/auth/resend-verification` | No | Reenviar email de verificación |
| `GET` | `/account/profile` | Si | Obtener perfil del tutor |
| `GET` | `/users` | Si | Listar alumnos del tutor |
| `POST` | `/users` | Si | Crear alumno |
| `GET` | `/users/:id` | Si | Obtener alumno por ID |
| `PUT` | `/users/:id` | Si | Actualizar alumno |
| `DELETE` | `/users/:id` | Si | Eliminar alumno |

### Flujo de autenticación

1. **Registro** → `POST /auth/signup` crea el tutor y envía email con token de verificación
2. **Verificación** → El tutor hace clic en el enlace del email → `GET /auth/verify-email?token=...`
3. **Login** → `POST /auth/login` valida credenciales + email verificado → devuelve Bearer token (30 días)
4. **Peticiones autenticadas** → Header `Authorization: Bearer <token>`

---

## Arquitectura Mobile

```
mobile/
├── app/
│   ├── _layout.tsx      # Layout raíz Expo Router (Stack sin header)
│   └── index.tsx         # Pantalla principal → renderiza WebViewGame
├── src/
│   ├── config.ts         # URL del juego (dev: localhost / prod: dominio)
│   └── WebViewGame.tsx   # WebView fullscreen + modo inmersivo + botón atrás Android
└── android/              # Proyecto nativo Android (generado por Expo prebuild)
```

La app móvil es un **wrapper WebView** que carga el juego web tal cual dentro de React Native. Esto permite mantener un solo codebase del juego para web y móvil.

---

## Sistema de niveles

El juego tiene **40 niveles** organizados en **4 mundos**:

| Mundo | Nombre | Niveles | Mecánicas |
|-------|--------|---------|-----------|
| 1 | Tierra de Luces | 1–10 | Movimiento básico, giros, encender luces |
| 2 | Islas del Código | 11–20 | Bucles (`LOOP_UNTIL_PLANT`), plantas |
| 3 | Galaxia Robot | 21–30 | Variables de color, `COPY_VAR` |
| 4 | Volcán Digital | 31–40 | Combinación de todas las mecánicas |

### Condiciones de victoria (comprobadas en orden)
1. Los colores de las variables coinciden con los objetivos
2. El robot llega a la planta
3. Todas las luces están encendidas

### Tipos de celda
`floor`, `light`, `wall`, `plant`, `variable`, `empty`

### Comandos disponibles
`MOVE_FORWARD`, `TURN_LEFT`, `TURN_RIGHT`, `LIGHT_TOGGLE`, `LOOP_UNTIL_PLANT`, `COPY_VAR`

---

## Cómo jugar

1. Selecciona comandos de la paleta (clic o arrastrar) para construir la cola de instrucciones
2. Pulsa **Ejecutar** — el robot sigue las instrucciones paso a paso
3. Enciende todas las luces o cumple la condición de victoria del nivel
4. Pulsa **Reiniciar** en cualquier momento para volver a empezar
5. En niveles con modo texto, escribe comandos en español (ej: "avanzar", "girar izquierda", "luz")

---

## Añadir un nuevo nivel

1. Crear `src/game/levels/levelN.ts`:

```ts
import { LevelDef, Direction } from '../../types/game.types'

const levelN: LevelDef = {
  id: N,
  name: 'Nombre del nivel',
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

2. Registrarlo en `LevelManager.ts` importándolo y añadiéndolo al array `LEVELS`
3. Actualizar el mundo correspondiente en `LevelSelectScreen.tsx`

---

## Añadir un nuevo comando

1. Añadir el valor al enum `Command` en `game.types.ts`
2. Añadir metadatos a `COMMAND_META` en `commands.ts`
3. Implementar el caso en `GameScene.applyCommand()`
4. Añadir el método de acción en `Robot` si es necesario
5. Añadir alias en español en `textCommandParser.ts`

---

## Licencia

MIT

## Autor

albertoportfolio