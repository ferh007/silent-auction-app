# Silent Auction App

Full-stack silent auction platform built with **React**, **Node/Express**, **MongoDB**, **Firebase Authentication**, and **Socket.IO**.  
Users can browse items, place bids in real time, and view bid history.  
Admins can create, close, and delete auctions, with automatic winner emails and outbid notifications.

---

## Table of Contents
- [Architecture](#architecture)
- [Front-End Component Map](#front-end-component-map)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [Install & Run](#install--run)
- [Security](#security)
- [Real-Time Events](#real-time-events)
- [Email Notifications](#email-notifications)

---

## Architecture

```
[ React Client (client/) ]              [ Node/Express API (server/) ]
 ├─ Pages & Components                   ├─ Routes (routes/items.js)
 ├─ Auth (Firebase Auth) ──JWT─────────▶ ├─ Middleware (verifyToken)
 ├─ Axios (api.js) ────────REST────────▶ ├─ Controllers/Handlers
 └─ Socket.IO client ◀──WebSocket──────▶ ├─ Socket.IO server
                                         ├─ Models (AuctionItem, Bid)
                                         └─ MongoDB (Mongoose)
```

**Key points:**
- **ID token verification:** `verifyToken` middleware uses Firebase Admin SDK to verify Firebase ID tokens.
- **Auto-close auctions:** `GET /api/items` checks `endDate` and closes expired auctions, determines winners, sends email, and emits `auctionEnded`.

---

## Front-End Component Map

**Routes (React Router)**

```
<App>
 └─ <AuthProvider>
     └─ <Router>
         ├─ "/login"        → <Login />
         ├─ "/register"     → <Register />
         ├─ "/"             → <PrivateRoute>
         │                     └─ <Navbar /> + <AuctionList /> + <TimeLeft />
         ├─ "/item/:id"     → <PrivateRoute>
         │                     └─ <Navbar /> + <ItemDetails /> + <TimeLeft />
         └─ "/admin"        → <AdminRoute>
                               └─ <Navbar /> + <AdminDashboard />
```

**Page responsibilities:**
- **Login:** Firebase email/password sign-in; redirects based on `isAdmin`.
- **Register:** Create account and set `displayName`.
- **AuctionList:** Fetch items, search, countdown timers, subscribe to `auctionEnded` / `bidUpdate`.
- **ItemDetails:** Fetch item & bid history; bid via `POST /api/items/:id/bid`.
- **AdminDashboard:** Create, close, and delete auctions.

---

## Features
- Firebase Authentication (ID token via Axios interceptor).
- Real-time bidding with Socket.IO (`bidUpdate`, `auctionEnded`).
- Email notifications with Nodemailer:
  - **Winner email** when auction closes.
  - **Outbid email** when highest bid changes.
- Auto-close expired auctions.
- Component-scoped CSS for clean styling.

---

## API Endpoints

**Public**
- `GET /api/items` – List items (auto-close expired auctions).
- `GET /api/items/:id` – Get item details + bid history.

**Protected** (requires `Authorization: Bearer <Firebase ID token>`)
- `POST /api/items/:id/bid` – Place a bid.
- `PATCH /api/items/:id/close` – Admin only; close auction and send winner email.
- `DELETE /api/items/:id` – Admin only; delete item and bids.
- `POST /api/items` – Admin only; create new item.

---

## Project Structure

```
client/                     # React frontend
  ├─ src/
  │   ├─ api.js              # Axios with Firebase token
  │   ├─ firebase.js         # Firebase client init
  │   ├─ contexts/AuthContext.js
  │   ├─ components/Navbar.jsx
  │   ├─ pages/
  │   │   ├─ Login.jsx
  │   │   ├─ Register.jsx
  │   │   ├─ AuctionList.jsx
  │   │   ├─ ItemDetails.jsx
  │   │   └─ AdminDashboard.jsx
  │   ├─ App.js
  │   └─ index.js

server/                     # Node/Express backend
  ├─ models/
  │   ├─ AuctionItem.js
  │   └─ Bid.js
  ├─ routes/items.js
  ├─ middlewares/verifyToken.js
  ├─ utils/email.js
  ├─ app.js
  └─ package.json
```

---

## Getting Started

### Environment Variables

**server/.env**
```ini
PORT=5000
MONGO_URI=<your-mongodb-uri>
ADMIN_EMAIL=<admin@example.com>
CLIENT_URL=http://localhost:3000
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>
FROM_EMAIL="Auction App" <no-reply@auction.com>
```

**client/.env**
```ini
REACT_APP_FIREBASE_API_KEY=<firebase-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<firebase-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<firebase-messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<firebase-app-id>
REACT_APP_API_URL=http://localhost:5000
```

---

### Install & Run

**Backend**
```bash
cd server
npm install
npm start
```

**Frontend**
```bash
cd client
npm install
npm start
```

---

## Security
- **Auth boundary:** All routes except `/login` and `/register` are protected.
- **AdminRoute:** Restricts `/admin` to `isAdmin` users (email match with `ADMIN_EMAIL`).
- **Server-side checks:** Validates bid amount > current price, future end date, and token validity.

---

## Real-Time Events
- `bidUpdate`: Broadcast when a new highest bid is placed.
- `auctionEnded`: Broadcast when an auction ends (auto or admin).

---

## Email Notifications
- **Winner email** – sent when auction closes.
- **Outbid email** – sent to previous highest bidder.
- Powered by Nodemailer with SMTP configuration.


