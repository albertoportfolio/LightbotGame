---
name: lightbot-api
description: This skill should be used when the user asks to "add a route", "create a controller", "add a model", "create a migration", "add middleware", "add a validator", "modify authentication", "add an endpoint", "create a transformer", or works on any AdonisJS backend logic, database schema, API endpoints, request validation, or access token management in the lightbotAPI project. Also trigger when the user mentions AdonisJS, Lucid ORM, VineJS, controllers, migrations, HttpContext, or any file inside the lightbotAPI/ directory.
version: 0.1.0
---

# LightbotAPI — AdonisJS Backend Development

This skill provides guidance for developing and extending the Lightbot authentication API built with AdonisJS v7, Lucid ORM, and TypeScript.

## Architecture Overview

The API is a **stateless REST backend** at `lightbotAPI/` that provides user authentication and profile management for the Lightbot game. It uses **token-based auth** (Bearer tokens stored in SQLite), **VineJS** for request validation, and a custom **ApiSerializer** for consistent JSON responses.

**Base URL:** `/api/v1`
**Default port:** `3333`
**Database:** SQLite via `better-sqlite3`

### Key File Map

| Area | File | Purpose |
|------|------|---------|
| Routes | `start/routes.ts` | All API endpoints grouped under `/api/v1` |
| Kernel | `start/kernel.ts` | Server + router middleware stack, named middleware |
| Auth config | `config/auth.ts` | Guard definitions (api: tokens, web: session) |
| User model | `app/models/user.ts` | Lucid model with `withAuthFinder` mixin and `accessTokens` |
| Validators | `app/validators/user.ts` | VineJS schemas for signup and login |
| Transformer | `app/transformers/user_transformer.ts` | Safe user serialization (hides password) |
| Serializer | `providers/api_provider.ts` | Custom `ApiSerializer` wrapping all responses in `{ data: ... }` |
| Migrations | `database/migrations/` | `users` and `auth_access_tokens` tables |
| Config | `adonisrc.ts` | Providers, preloads, hooks, test suites |

### Controllers

| Controller | Methods | Purpose |
|-----------|---------|---------|
| `NewAccountController` | `store()` | Signup — validates, creates user, returns token |
| `AccessTokenController` | `store()`, `destroy()` | Login and logout |
| `ProfileController` | `show()` | Returns authenticated user profile |

## Current Routes

```
POST   /api/v1/auth/signup    → NewAccountController.store    (public)
POST   /api/v1/auth/login     → AccessTokenController.store   (public)
POST   /api/v1/auth/logout    → AccessTokenController.destroy (auth)
GET    /api/v1/account/profile → ProfileController.show       (auth)
GET    /                       → health check
```

Routes use lazy-loaded controller references via `#generated/controllers` (Tuyau registry).

## Adding a New Endpoint

### Step 1: Create the controller

Create `lightbotAPI/app/controllers/my_controller.ts`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class MyController {
  async index({ serialize }: HttpContext) {
    const data = { /* ... */ }
    return serialize(data)
  }
}
```

### Step 2: Add a validator (if needed)

Add validation rules in `lightbotAPI/app/validators/`:

```typescript
import vine from '@vinejs/vine'

export const myValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100),
  value: vine.number().positive(),
})
```

Use in controller: `const payload = await request.validateUsing(myValidator)`

### Step 3: Register the route

Add to `lightbotAPI/start/routes.ts` inside the `/api/v1` group:

```typescript
router
  .group(() => {
    router.get('/', [controllers.MyController, 'index'])
    router.post('/', [controllers.MyController, 'store'])
  })
  .prefix('my-resource')
  .as('myResource')
  .use(middleware.auth())  // if auth required
```

### Step 4: Run `node ace generate:manifest` to update the Tuyau controller registry.

## Adding a New Model

### Step 1: Create migration

```bash
cd lightbotAPI && node ace make:migration create_items_table
```

Edit the generated file in `database/migrations/`:

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### Step 2: Run migration

```bash
cd lightbotAPI && node ace migration:run
```

This auto-generates the schema type in `#database/schema`.

### Step 3: Create the model

Create `lightbotAPI/app/models/item.ts`:

```typescript
import { ItemSchema } from '#database/schema'

export default class Item extends ItemSchema {
  // Add relationships, computed properties, etc.
}
```

### Step 4: Create a transformer

Create `lightbotAPI/app/transformers/item_transformer.ts`:

```typescript
import type Item from '#models/item'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ItemTransformer extends BaseTransformer<Item> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'userId',
      'createdAt',
      'updatedAt',
    ])
  }
}
```

## Middleware Stack

**Server-level** (all requests):
1. `ForceJsonResponseMiddleware` — sets `Accept: application/json`
2. `ContainerBindingsMiddleware` — DI bindings
3. `@adonisjs/cors` — CORS headers

**Router-level** (matched routes):
1. `bodyparser` → `session` → `shield` → `initialize_auth` → `silent_auth`

**Named** (explicit on routes):
- `auth` — requires valid Bearer token, returns 401 otherwise

## Response Format

All responses use the custom `ApiSerializer` from `providers/api_provider.ts`:

```json
{
  "data": {
    "user": { "id": 1, "fullName": "...", "email": "...", "initials": "..." },
    "token": "oat_..."
  }
}
```

Use `ctx.serialize(data)` in controllers. For unwrapped responses: `ctx.serialize.withoutWrapping(data)`.

## Authentication Flow

1. **Signup/Login** returns a `token` string (opaque access token)
2. Client sends: `Authorization: Bearer oat_...` on subsequent requests
3. `auth` middleware validates the token against `auth_access_tokens` table
4. Access user in controller via `auth.getUserOrFail()`
5. **Logout** deletes the current token from DB

## Validation Patterns

Validators use **VineJS** (`@vinejs/vine`):

```typescript
import vine from '@vinejs/vine'

export const myValidator = vine.create({
  email: vine.string().email().maxLength(254),
  name: vine.string().minLength(1).nullable(),
  age: vine.number().positive().optional(),
  role: vine.enum(['admin', 'user']),
  // Unique DB check:
  username: vine.string().unique({ table: 'users', column: 'username' }),
  // Confirmation field:
  password: vine.string().minLength(8).maxLength(32),
  passwordConfirmation: vine.string().sameAs('password'),
})
```

## Database Schema

**users:**
`id` (PK) | `full_name` (nullable) | `email` (unique, 254) | `password` | `created_at` | `updated_at`

**auth_access_tokens:**
`id` (PK) | `tokenable_id` (FK→users, CASCADE) | `type` | `name` | `hash` | `abilities` (JSON) | `created_at` | `updated_at` | `last_used_at` | `expires_at`

## Commands Reference

```bash
cd lightbotAPI
node ace serve --hmr          # Dev server with hot reload
node ace build                # Production build
node ace migration:run        # Run pending migrations
node ace migration:rollback   # Rollback last batch
node ace make:migration       # Create migration file
node ace make:controller      # Create controller
node ace make:model           # Create model
node ace generate:manifest    # Regenerate Tuyau controller registry
node ace test                 # Run Japa tests
```

## Conventions

- All import aliases use `#` prefix: `#models/user`, `#validators/user`, `#transformers/...`, `#start/kernel`, `#generated/controllers`
- Controllers are lazy-loaded via Tuyau `controllers` registry, not direct imports
- Models extend auto-generated schema classes from `#database/schema`
- Transformers use `this.pick()` to whitelist fields (never expose `password`)
- Column names in DB use `snake_case`, model properties use `camelCase` (Lucid auto-converts)

## Additional Resources

### Reference Files

For detailed patterns and examples, consult:
- **`references/api-patterns.md`** — Complete examples of CRUD endpoints, relationships, pagination, and testing
