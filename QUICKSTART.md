# Quick Start Guide

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ MongoDB installed and running (`mongod` or MongoDB Atlas)
- ✅ Terminal/Command Prompt open

## Step-by-Step Setup (5 minutes)

### Step 1: Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas:**
- Use your Atlas connection string in `backend/.env`

### Step 2: Seed the Database

Open a new terminal window:

```bash
cd /Users/bahtee/Desktop/Esmuscafe/backend
npm run seed
```

You should see:
```
✓ Admin user created
✓ 3 restaurants with owners created
✓ Created products for all restaurants

=== Seed completed successfully! ===
```

### Step 3: Start Backend Server

In the same terminal:

```bash
npm run start:dev
```

Wait until you see:
```
Application is running on: http://localhost:3001
```

### Step 4: Start Frontend Server

Open another terminal window:

```bashf
cd /Users/bahtee/Desktop/Esmuscafe/frontend
npm run dev
```

Wait until you see:
```
✓ Ready in X ms
```

### Step 5: Open the App

Open your browser and go to:
```
http://localhost:3000
```

You should see the Esmuscafe landing page with 3 restaurants!

## Test the Features

### 1. Browse as Public User
- Click on any restaurant
- View the menu items

### 2. Sign Up as a Regular User
1. Go to `http://localhost:3000/login`
2. Tap the **Sign Up** tab (right side)
3. Enter a nickname and password
4. You'll be registered and redirected to the home page

### 3. Login as a Regular User
1. Go to `http://localhost:3000/login`
2. Stay on the **Login** tab (left side)
3. Enter your nickname and password

### 4. Login as Admin
1. Go to `http://localhost:3000/login`
2. Nickname: `admin`
3. Password: `admin123`
4. You'll be redirected to the admin dashboard
5. Try creating/editing restaurants and products

### 5. Login as Restaurant Owner
1. Go to `http://localhost:3000/login`
2. Nickname: `owner1` (or `owner2` / `owner3`)
3. Password: `owner123`
4. You'll be redirected to the products dashboard
5. Try adding/editing your restaurant's products

## Share via Telegram

### Option 1: Local Network (Same WiFi)

1. Find your local IP:
   - **Mac/Linux**: `ifconfig | grep "inet "`
   - **Windows**: `ipconfig`

2. Share the URL:
   ```
   http://YOUR_IP:3000
   Example: http://192.168.1.100:3000
   ```

### Option 2: ngrok (Public URL)

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Create tunnel:
   ```bash
   ngrok http 3000
   ```

3. Copy the HTTPS URL and share via Telegram:
   ```
   https://abc123.ngrok.io
   ```

## Troubleshooting

### Backend won't start
- ✅ Check MongoDB is running
- ✅ Check port 3001 is not in use
- ✅ Verify `.env` file exists in backend folder

### Frontend won't start
- ✅ Check port 3000 is not in use
- ✅ Verify `.env.local` file exists in frontend folder
- ✅ Make sure backend is running first

### Can't login
- ✅ Make sure you ran the seed script
- ✅ Check backend console for errors
- ✅ Use the exact nickname/password from the table below

### Seed fails with duplicate key error
- ✅ The old `email_1` MongoDB index may still exist from a previous version
- ✅ Run this to drop it, then re-seed:
  ```bash
  node -e "
  const { MongoClient } = require('mongodb');
  MongoClient.connect('mongodb://localhost:27017/esmuscafe').then(async c => {
    await c.db().collection('users').dropIndex('email_1');
    console.log('Done'); await c.close();
  });
  "
  npm run seed
  ```

### No restaurants showing
- ✅ Check browser console for errors
- ✅ Verify backend is running on port 3001
- ✅ Make sure CORS is not blocking requests

## Default Accounts

| Role | Nickname | Password | Access |
|------|----------|----------|--------|
| Admin | admin | admin123 | Full access |
| Owner 1 | owner1 | owner123 | Pizza Palace |
| Owner 2 | owner2 | owner123 | Burger House |
| Owner 3 | owner3 | owner123 | Sushi Garden |

> Regular users sign up directly on the Login page — no pre-seeded accounts needed.

## What's Next?

- 📱 Test on your mobile device
- 🎨 Customize the design
- 📸 Add your own restaurant images
- 🚀 Deploy to production
- 🔒 Change default passwords

## Need Help?

Check the main README.md for more detailed information.
