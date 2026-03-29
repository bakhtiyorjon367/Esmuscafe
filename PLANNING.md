# Esmuscafe PWA — Full Architecture Plan

## Current Stack Summary

- **Backend**: NestJS 11 + MongoDB/Mongoose + JWT auth
- **Frontend**: React 19 + Ionic 8 + React Router v5 + Axios
- **Mobile**: Capacitor 8 (PWA-first)

---

## Roles

- `admin` — manages restaurants and users
- `restaurant_owner` — manages their own restaurant's products/categories
- `user` — browses, logs in, likes, comments, adds to cart

---

## Backend Changes

### New / Updated Schemas

**Product** (extend existing)

- `readyAt` — `number | null` — minutes until product is ready (e.g. 30 = ready in 30 min)
- `tags` — `string[]` — for `['suggested', 'new']` badges
- `likes` — `ObjectId[]` ref `User` — array of user IDs who liked
- `likeCount` — `number` (stored, updated on like/unlike)
- `commentCount` — `number` (computed from Comment collection)

**Comment** (new schema)

- `productId` — ObjectId ref `Product`, required
- `userId` — ObjectId ref `User`, required
- `text` — string, required
- `createdAt`, `updatedAt`

**CartItem** (embedded in Cart)

- Stored server-side in a `Cart` collection (one per user)
- `userId` — ObjectId ref `User`
- `restaurantId` — ObjectId ref `Restaurant`
- `items[]` — `{ productId, quantity, priceSnapshot }`
- Cart is scoped to a single restaurant (switching restaurant clears/warns)

**Order** (new schema — Phase 2)

- `userId`, `restaurantId`, `items[]`, `status`, `totalPrice`, `createdAt`
- Triggers Telegram notification via bot on creation

### New / Updated API Endpoints

**Products**

- `GET /products?restaurantId=&categoryId=` — filter by category (add categoryId filter)
- `GET /products?tag=suggested|new` — filter by tag
- `POST /products/:id/like` — toggle like (auth required)
- `GET /products/:id/comments` — list comments
- `POST /products/:id/comments` — add comment (auth required)

**Cart** (new)

- `GET /cart` — get current user's cart (JWT required)
- `POST /cart/items` — add item `{ productId, quantity }`
- `PATCH /cart/items/:productId` — update quantity
- `DELETE /cart/items/:productId` — remove item
- `DELETE /cart` — clear cart

**Orders** (Phase 2)

- `POST /orders` — place order from cart
- `GET /orders` — restaurant owner sees their orders (scoped by restaurantId)
- `GET /orders/my` — user sees their own order history

**Auth / Users**

- `PATCH /users/me` — update nickname, password (user edits own profile)

---

## Frontend Pages & Components

### Routing (updated)

| Path | Component | Guard | Role |
| --- | --- | --- | --- |
| `/` | `Home` | none | all |
| `/restaurant/:id` | `RestaurantDetail` | none | all |
| `/restaurant/:restaurantId/product/:productId` | `ProductDetail` | none | all |
| `/login` | `Login` | none | guest |
| `/cart` | `Cart` | `AuthGuard` | user |
| `/my` | `MyProfile` | `AuthGuard` | user |
| `/admin/restaurants` | `AdminRestaurants` | `AuthGuard` | admin |
| `/admin/products` | `AdminProducts` | `AuthGuard` | admin |
| `/dashboard/products` | `DashboardProducts` | `AuthGuard` | restaurant_owner |
| `/dashboard/categories` | `DashboardCategories` | `AuthGuard` | restaurant_owner |
| `/dashboard/my` | `DashboardMyRestaurant` | `AuthGuard` | restaurant_owner |
| `/dashboard/orders` | `DashboardOrders` | `AuthGuard` | restaurant_owner (Phase 2) |

### Global Layout Header Changes

Top-right header buttons (visible on all user-facing pages):

- **Cart icon** (IonBadge with item count) → `/cart` — only shown when logged in
- **My icon** (person icon) → `/my` if logged in, else `/login`

### Page: `RestaurantDetail` (redesign)

- Category tabs at top (unchanged)
- Product list switches from 2-column grid to **full-width list layout**:
  - Left side: product name, ingredients, price, tags (Suggested / New badge), ready-at time
  - Right side: product image with overlay `(+)` add-to-cart button (if logged in)
  - Like button + count, comment button + count below product info
  - Tapping product name or image navigates to `/restaurant/:restaurantId/product/:productId`
- Products fetched per selected category via `GET /products?restaurantId=&categoryId=`

### Page: `ProductDetail` (new)

- Full product details at top (image, name, description, ingredients, price, tags, readyAt)
- Like button + count
- Comments section below: list of comments (user nickname + text + date)
- Add comment input (auth required, shown if logged in)

### Page: `DashboardProducts` (update)

Layout: Categories section first, then Products section

- **Categories sub-section** (at top):
  - "Add Category" button
  - List of existing categories with delete button
- **Products sub-section** (below):
  - Products filtered by selected category
  - CRUD buttons per product
  - Form fields: name, description, ingredients, price, discount, image URL, category (dropdown), tags (multi-select: Suggested / New), readyAt (number in minutes, optional), isAvailable toggle

### Page: `DashboardMyRestaurant` (new)

- Restaurant owner can edit: name, description, address, image URL
- Read-only display of owner info

### Page: `Cart` (new)

- List of items: image, name, quantity stepper, price
- Total price display
- Place Order button (Phase 2: triggers order creation + Telegram notification)
- Clear cart button

### Page: `MyProfile` (new)

- Display nickname, name
- Edit form: new password, confirm password
- Logout button

### Component: `ProductListItem` (redesign)

Current: compact 2-column grid card
New: full-width horizontal list item

```
+-------------------------------------------+
| [Product Details]        | [Product Image] |
| Name (bold)              | [img]           |
| Ingredients (small text) |      [+]        |
| Price / discount         |                 |
| [Suggested][New] badges  | (if readyAt:    |
| [♥ 12] [💬 3]            |  blur + time)   |
+-------------------------------------------+
```

- If `readyAt` is set, overlay the image with a blur and show the ready time
- `(+)` button only shown if user is logged in; tapping without login prompts redirect to `/login`

### Component: `CartButton` (new)

Global header button with item count badge, shown when logged in.

### Global State

Introduce a lightweight React Context (`CartContext`) to share cart state:

- `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- Persisted to `localStorage` as optimistic cache; synced with `/cart` API on login

---

## TypeScript Types (`frontend/src/types/index.ts`)

Add to `Product`:

- `readyAt?: number` — minutes until ready (null = available now)
- `tags?: ('suggested' | 'new')[]`
- `likes?: string[]`
- `likeCount?: number`
- `commentCount?: number`

New interfaces:

- `Comment { _id, productId, userId: string | User, text, createdAt }`
- `CartItem { productId: string | Product, quantity: number, priceSnapshot: number }`
- `Cart { _id, userId, restaurantId, items: CartItem[] }`
- `Order { _id, userId, restaurantId, items, status, totalPrice, createdAt }` (Phase 2)

---

## Phased Roadmap

### Phase 1 — Core (Current)

1. Backend: extend Product schema (tags, readyAt, likes, likeCount, commentCount)
2. Backend: Comment schema + endpoints
3. Backend: Cart schema + endpoints
4. Backend: `PATCH /users/me`
5. Backend: `POST /products/:id/like` toggle
6. Frontend: Update `types/index.ts`
7. Frontend: `CartContext` provider
8. Frontend: Redesign `ProductListItem` (horizontal layout, like/comment, readyAt blur)
9. Frontend: Update `RestaurantDetail` (fetch by categoryId, new list layout)
10. Frontend: Update `DashboardProducts` (categories on top, new product fields)
11. Frontend: New `DashboardMyRestaurant` page
12. Frontend: New `Cart` page
13. Frontend: New `MyProfile` page
14. Frontend: Header cart + My buttons on all user-facing pages
15. Frontend: Update `App.tsx` routes + CartContext
16. Frontend: New `ProductDetail` page (`/restaurant/:id/product/:id`)

### Phase 2 — Orders & Notifications (Later)

1. Backend: Order schema + endpoints
2. Backend: Telegram bot integration (notify restaurant_owner on new order)
3. Frontend: `DashboardOrders` page for restaurant owners
4. Frontend: Order history in `MyProfile`

### Phase 3 — Chat (Later)

- Chat integration (Telegram or custom WebSocket-based chat)

---

## Files to Create / Modify

**Backend (new files)**

- `backend/src/comments/` — module, schema, service, controller, DTOs
- `backend/src/cart/` — module, schema, service, controller, DTOs
- `backend/src/orders/` — module, schema, service, controller, DTOs (Phase 2)

**Backend (modified)**

- `backend/src/products/product.schema.ts` — add `readyAt`, `tags`, `likes`, `likeCount`, `commentCount`
- `backend/src/products/products.service.ts` — like toggle, filter by tag/category
- `backend/src/products/products.controller.ts` — new like/comment routes
- `backend/src/users/users.controller.ts` — add `PATCH /users/me`
- `backend/src/app.module.ts` — register new modules

**Frontend (new files)**

- `frontend/src/pages/Cart.tsx`
- `frontend/src/pages/MyProfile.tsx`
- `frontend/src/pages/DashboardMyRestaurant.tsx`
- `frontend/src/pages/ProductDetail.tsx`
- `frontend/src/context/CartContext.tsx`
- `frontend/src/components/CartButton.tsx`
- `frontend/src/lib/cart.ts` — cart API helpers

**Frontend (modified)**

- `frontend/src/types/index.ts` — add new interfaces/fields
- `frontend/src/App.tsx` — add new routes, wrap with CartContext
- `frontend/src/pages/RestaurantDetail.tsx` — redesign product list, add like/comment
- `frontend/src/pages/DashboardProducts.tsx` — categories section at top, new product fields
- `frontend/src/components/ProductListItem.tsx` — full horizontal redesign
