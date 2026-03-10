# LightbotAPI — Detailed Patterns & Examples

## Existing Code Examples

### Signup Flow (complete reference)

**Validator** (`app/validators/user.ts`):
```typescript
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})
```

**Controller** (`app/controllers/new_account_controller.ts`):
```typescript
export default class NewAccountController {
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)
    const user = await User.create({ fullName, email, password })
    const token = await User.accessTokens.create(user)
    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}
```

**Route** (`start/routes.ts`):
```typescript
router.post('signup', [controllers.NewAccount, 'store'])
```

### User Model (complete reference)

```typescript
import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
```

### Transformer Pattern

```typescript
import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'fullName',
      'email',
      'createdAt',
      'updatedAt',
      'initials',
    ])
  }
}
```

---

## CRUD Endpoint Pattern

### Full example: Items resource

**Migration:**
```typescript
// database/migrations/XXXX_create_items_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.text('description').nullable()
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

**Model:**
```typescript
// app/models/item.ts
import { ItemSchema } from '#database/schema'
import type User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Item extends ItemSchema {
  @belongsTo(() => import('#models/user'))
  declare user: BelongsTo<typeof User>
}
```

**User model relationship:**
```typescript
// Add to app/models/user.ts
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

@hasMany(() => import('#models/item'))
declare items: HasMany<typeof Item>
```

**Transformer:**
```typescript
// app/transformers/item_transformer.ts
import type Item from '#models/item'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ItemTransformer extends BaseTransformer<Item> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'description',
      'userId',
      'createdAt',
      'updatedAt',
    ])
  }
}
```

**Validator:**
```typescript
// app/validators/item.ts
import vine from '@vinejs/vine'

export const createItemValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100),
  description: vine.string().maxLength(500).nullable(),
})

export const updateItemValidator = vine.create({
  name: vine.string().minLength(1).maxLength(100).optional(),
  description: vine.string().maxLength(500).nullable().optional(),
})
```

**Controller:**
```typescript
// app/controllers/items_controller.ts
import Item from '#models/item'
import ItemTransformer from '#transformers/item_transformer'
import { createItemValidator, updateItemValidator } from '#validators/item'
import type { HttpContext } from '@adonisjs/core/http'

export default class ItemsController {
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const items = await Item.query().where('userId', user.id)
    return serialize(items.map((item) => ItemTransformer.transform(item)))
  }

  async store({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createItemValidator)
    const item = await Item.create({ ...payload, userId: user.id })
    return serialize(ItemTransformer.transform(item))
  }

  async show({ auth, params, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const item = await Item.query().where('id', params.id).where('userId', user.id).firstOrFail()
    return serialize(ItemTransformer.transform(item))
  }

  async update({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const item = await Item.query().where('id', params.id).where('userId', user.id).firstOrFail()
    const payload = await request.validateUsing(updateItemValidator)
    item.merge(payload)
    await item.save()
    return serialize(ItemTransformer.transform(item))
  }

  async destroy({ auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const item = await Item.query().where('id', params.id).where('userId', user.id).firstOrFail()
    await item.delete()
    return { message: 'Item deleted' }
  }
}
```

**Routes:**
```typescript
// Add to start/routes.ts inside the /api/v1 group
router
  .group(() => {
    router.get('/', [controllers.Items, 'index'])
    router.post('/', [controllers.Items, 'store'])
    router.get('/:id', [controllers.Items, 'show'])
    router.put('/:id', [controllers.Items, 'update'])
    router.delete('/:id', [controllers.Items, 'destroy'])
  })
  .prefix('items')
  .as('items')
  .use(middleware.auth())
```

---

## Pagination Pattern

```typescript
async index({ auth, request, serialize }: HttpContext) {
  const user = auth.getUserOrFail()
  const page = request.input('page', 1)
  const limit = request.input('limit', 20)

  const items = await Item.query()
    .where('userId', user.id)
    .orderBy('createdAt', 'desc')
    .paginate(page, limit)

  return serialize(items.toJSON())
}
```

Response:
```json
{
  "data": [...],
  "meta": {
    "total": 50,
    "per_page": 20,
    "current_page": 1,
    "last_page": 3,
    "first_page": 1
  }
}
```

---

## Testing Patterns

### Functional test

```typescript
// tests/functional/auth/signup.spec.ts
import { test } from '@japa/runner'

test.group('Auth signup', () => {
  test('should create a new user', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({ data: { user: { email: 'test@example.com' } } })
  })

  test('should fail with duplicate email', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertStatus(422)
  })
})
```

### Authenticated request test

```typescript
test('should return user profile', async ({ client }) => {
  const user = await UserFactory.create()
  const token = await User.accessTokens.create(user)

  const response = await client
    .get('/api/v1/account/profile')
    .bearerToken(token.value!.release())

  response.assertStatus(200)
  response.assertBodyContains({ data: { email: user.email } })
})
```
