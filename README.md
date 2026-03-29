<<<<<<< HEAD
# Esmuscafe Restaurant Platform

A full-stack restaurant platform built with Ionic (React), Nest.js, and MongoDB.

## Features

- **Public Users**: Browse restaurants and view their menus
- **Restaurant Owners**: Manage their own restaurant's products
- **Admins**: Full control over restaurants and products
- **Mobile-First Design**: Ionic UI optimized for mobile and web
- **PWA-Ready**: Can be installed on devices; optional Capacitor for app stores

## Tech Stack

### Frontend
- Ionic 8 + React
- TypeScript
- Vite
- React Router
- Axios for API calls

### Backend
- Nest.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Role-based access control

## Prerequisites

- Node.js 18 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone and Setup

```bash
cd /Users/bahtee/Desktop/Esmuscafe
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Create .env file (already created)
# MONGODB_URI=mongodb://localhost:27017/esmuscafe
# JWT_SECRET=esmuscafe-secret-key-change-in-production
# PORT=3001

# Start MongoDB (if running locally)
# mongod

# Run seed script to populate database
npm run seed

# Start backend server
npm run start:dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional; defaults to http://localhost:3001)
# VITE_API_URL=http://localhost:3001

# Start frontend dev server
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

## Default Login Credentials

After running the seed script, use these credentials:

### Admin
- Email: `admin@esmuscafe.com`
- Password: `admin123`

### Restaurant Owners
- Pizza Palace: `owner1@esmuscafe.com` / `owner123`
- Burger House: `owner2@esmuscafe.com` / `owner123`
- Sushi Garden: `owner3@esmuscafe.com` / `owner123`

## Usage

### Public Access
1. Open `http://localhost:5173` in your browser
2. Browse the 3 restaurants
3. Click on any restaurant to view their menu

### Admin Access
1. Go to `http://localhost:5173/login`
2. Login with admin credentials
3. You'll be redirected to `/admin/restaurants`
4. Manage restaurants and products

### Restaurant Owner Access
1. Go to `http://localhost:5173/login`
2. Login with owner credentials
3. You'll be redirected to `/dashboard/products`
4. Manage your restaurant's products

## PWA Installation

### On Mobile (iOS/Android)

1. Open the app in your mobile browser
2. **iOS**: Tap the Share button → Add to Home Screen
3. **Android**: Tap the menu → Add to Home Screen
4. The app will be installed and work like a native app

### Testing PWA Locally

To test PWA features, you need HTTPS. Use one of these methods:

#### Option 1: Use ngrok
```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Run frontend (Vite default port 5173)
cd frontend
npm run dev

# In another terminal, create tunnel
ngrok http 5173

# Share the HTTPS URL for mobile testing
```

#### Option 2: Local Network (iPhone on same Wi‑Fi)

1. **Find your Mac’s current IP** (it can change; 192.168.0.104 was just an example):
   ```bash
   # Mac (Wi‑Fi is usually en0)
   ipconfig getifaddr en0
   ```
   If that’s empty, try `en1` or run `ifconfig | grep "inet "` and use the 192.168.x.x address.

2. **Start backend** (binds to all interfaces so iPhone can reach it):
   ```bash
   cd backend && npm run start:dev
   ```

3. **Start frontend** (dev server is configured to listen on the network):
   ```bash
   cd frontend && npm run dev
   ```
   Vite will show something like: `Local: http://localhost:5173/` and `Network: http://192.168.x.x:5173/`

4. **On your iPhone** (same Wi‑Fi): open Safari and go to **`http://YOUR_IP:5173`** (e.g. `http://192.168.1.42:5173`).  
   - **Frontend**: `http://YOUR_IP:5173`  
   - **Backend** is only used by the app; the frontend will call `http://YOUR_IP:3001` automatically.

5. If it still doesn’t load: check **Mac firewall** (System Settings → Network → Firewall) and allow incoming connections for Node/your terminal, or temporarily disable the firewall to test.

## Project Structure

The **active frontend** is the Ionic + React app in `frontend/`. The previous Next.js PWA is archived in `frontend-next/`.

```
Esmuscafe/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── restaurants/   # Restaurant CRUD
│   │   ├── products/      # Product CRUD
│   │   ├── users/         # User management
│   │   ├── database/      # MongoDB connection
│   │   ├── libs/          # Shared utilities
│   │   └── seed.ts        # Database seeding
│   └── package.json
├── frontend/               # Ionic + React (Vite) — main app
│   ├── src/
│   │   ├── pages/         # Home, Login, RestaurantDetail, Admin*, Dashboard*
│   │   ├── components/    # RestaurantCard, ProductCard, ProductListItem, AuthGuard
│   │   ├── lib/           # API client & auth
│   │   ├── types/         # TypeScript types
│   │   ├── theme/         # Ionic theme variables
│   │   └── App.tsx        # Routes (IonReactRouter)
│   ├── index.html
│   └── package.json
└── frontend-next/          # Archived Next.js PWA (reference only)
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Register user (admin only)
- `GET /auth/profile` - Get current user profile

### Restaurants
- `GET /restaurants` - List all restaurants (public)
- `GET /restaurants/:id` - Get restaurant by ID (public)
- `POST /restaurants` - Create restaurant (admin)
- `PATCH /restaurants/:id` - Update restaurant (admin/owner)
- `DELETE /restaurants/:id` - Delete restaurant (admin)

### Products
- `GET /products?restaurantId=:id` - List products (public)
- `GET /products/:id` - Get product by ID (public)
- `POST /products` - Create product (admin/owner)
- `PATCH /products/:id` - Update product (admin/owner)
- `DELETE /products/:id` - Delete product (admin/owner)

## Mobile Testing Checklist

- [ ] Landing page displays restaurants correctly
- [ ] Restaurant detail page shows products
- [ ] Login functionality works
- [ ] Admin can create/edit/delete restaurants
- [ ] Admin can create/edit/delete products
- [ ] Owner can manage their own products only
- [ ] Images load properly
- [ ] Touch interactions work smoothly
- [ ] PWA can be installed on device
- [ ] App works offline (with cached data)

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check the connection string in `backend/.env`
- If using MongoDB Atlas, ensure your IP is whitelisted

### "Failed to load restaurants" on iPhone (localhost works)
- The app on the phone calls your Mac’s API at `http://YOUR_MAC_IP:3001`. If that request is blocked, you’ll see this error.
- **1) Check backend is reachable from the phone**  
  On the iPhone, in Safari, open: `http://YOUR_MAC_IP:3001/restaurants`  
  (Replace YOUR_MAC_IP with the same IP you use for the app, e.g. from `ipconfig getifaddr en0` on the Mac.)  
  - If you see JSON with restaurant data → backend is reachable; the app should work (try reloading the app or clearing Safari cache).  
  - If the page doesn’t load or times out → **Mac firewall** is likely blocking port 3001.
- **2) Allow the backend through the Mac firewall**  
  **System Settings → Network → Firewall** (or **Security & Privacy → Firewall**):  
  - Either turn the firewall off temporarily to test, or  
  - Add an rule to allow incoming connections for **Node** (or the terminal app you use to run `npm run start:dev`).  
  Then try `http://YOUR_MAC_IP:3001/restaurants` on the iPhone again.
- **3) Same Wi‑Fi**  
  iPhone and Mac must be on the same Wi‑Fi network.

### CORS Error
- Backend CORS allows localhost:3000, localhost:5173 (Vite), and 192.168.x.x, 10.x.x.x, 172.16–31.x.x
- If using a different port or origin, add it in `backend/src/main.ts`

### PWA Not Installing
- PWA requires HTTPS in production
- Use ngrok or deploy to a server with SSL
- Clear browser cache and try again

## Next Steps

1. ✅ Backend API with authentication
2. ✅ Frontend with Ionic + React (Vite)
3. ✅ Admin & Owner dashboards
4. ✅ Seed script with sample data
5. 🔄 Test on mobile devices
6. 📱 Deploy to production server
7. 🎨 Replace placeholder icons with real ones
8. 📱 Optional: Add Capacitor for iOS/Android app store builds

## Notes

- Frontend uses `VITE_API_URL` (default `http://localhost:3001`); set in `frontend/.env` for production
- For production, change the JWT secret and use environment variables
- Consider adding image upload functionality instead of URL-based images
- Add pagination for products when restaurants have many items
- The previous Next.js PWA frontend is archived in `frontend-next/` if needed
=======
# Esmuscafe
This is PWA project for restaurants
>>>>>>> 092630d570d533f795d837a002ecd4f52d8deddb
