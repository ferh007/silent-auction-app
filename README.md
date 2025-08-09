Silent Auction App
Full-stack silent auction platform built with React, Node/Express, MongoDB, Firebase Authentication, and Socket.IO. Users can browse items, place bids in real time, and view bid history. Admins can create, close, and delete auctions, with automatic winner emails and outbid notifications.

Table of Contents
Architecture

Front-End Component Map

Features

API Endpoints

Project Structure

Getting Started

Environment Variables

Install & Run

Security

Real-Time Events

Email Notifications

Authors

License

Architecture
css
Copy
Edit
[ React Client (client/) ]                               [ Node/Express API (server/) ]
 ├─ Pages & Components                                     ├─ Routes (routes/items.js)
 ├─ Auth (Firebase Auth) ─── Bearer ID Token ───────────▶  ├─ Middleware (verifyToken)
 ├─ Axios (api.js) ─────── HTTPS REST ─────────────────▶   ├─ Controllers/Handlers
 └─ Socket.IO client ◀──── WebSocket ── Socket.IO ────▶     ├─ Socket.IO server
                                                           ├─ Models (AuctionItem, Bid)
                                                           └─ MongoDB (Mongoose)
ID token verification: verifyToken (server) uses Firebase Admin to verify the client’s Firebase ID token and attaches { uid, email } to req.user.

Auto-close: GET /api/items checks endDate for each item, closes ended auctions, determines winner, sends email, and emits auctionEnded.

Front-End Component Map
Routes (React Router)

php-template
Copy
Edit
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
Page responsibilities

Login: Firebase email/password sign-in; redirects to / or /admin based on isAdmin.

Register: Create account and set displayName.

AuctionList: Fetch all items, search, display countdown per item, subscribe to auctionEnded/bidUpdate.

ItemDetails: Fetch item + bid history; place bids (POST /api/items/:id/bid); show live time remaining.

AdminDashboard: Create, close, and delete auctions; form validates endDate and basePrice.

Features
Firebase Authentication (ID token injected in api.js via Axios interceptor)

Real-time bids with Socket.IO (bidUpdate, auctionEnded)

Email notifications with Nodemailer:

Winner email on auction close

Outbid email when highest bid changes

Auto-close past-due auctions on fetch

Clean, modular UI with component-scoped CSS

API Endpoints
Public

GET /api/items — List items (auto-closes any that passed endDate; may emit auctionEnded)

GET /api/items/:id — Get item details + bid history

Protected (requires valid Firebase ID token via Authorization: Bearer <token>)

POST /api/items/:id/bid — Place bid (validates amount, emits bidUpdate, may send outbid email)

PATCH /api/items/:id/close — Admin only; close auction, determine winner, send winner email

DELETE /api/items/:id — Admin only; delete item and associated bids

POST /api/items — Admin only; create new auction item

Admin is determined by comparing req.user.email to process.env.ADMIN_EMAIL.

Project Structure
ruby
Copy
Edit
client/                       # React frontend
  ├─ public/
  └─ src/
      ├─ api.js               # Axios instance (adds Firebase ID token + baseURL)
      ├─ firebase.js          # Firebase client init (getAuth)
      ├─ contexts/
      │   └─ AuthContext.js   # currentUser, isAdmin, loading, logout
      ├─ components/
      │   ├─ Navbar.jsx
      │   └─ Navbar.module.css
      ├─ pages/
      │   ├─ Login.jsx
      │   ├─ Register.jsx
      │   ├─ AuctionList.jsx
      │   ├─ AuctionList.module.css
      │   ├─ ItemDetails.jsx
      │   ├─ ItemDetails.module.css
      │   ├─ AdminDashboard.jsx
      │   └─ AdminDashboard.module.css
      ├─ App.js
      ├─ App.css
      ├─ index.js
      └─ index.css

server/                       # Node/Express backend
  ├─ models/
  │   ├─ AuctionItem.js       # Mongoose schema + hasEnded() method
  │   └─ Bid.js               # Mongoose schema for bids
  ├─ routes/
  │   └─ items.js             # All item & bid routes
  ├─ middlewares/
  │   └─ verifyToken.js       # Firebase Admin: verifies ID token, sets req.user
  ├─ utils/
  │   └─ email.js             # sendWinnerEmail, sendOutbidEmail
  ├─ app.js                   # Express app, CORS, Socket.IO, MongoDB connect
  └─ package.json
Getting Started
Environment Variables
Create the following .env files:

server/.env

ini
Copy
Edit
PORT=5000
MONGO_URI=<your-mongodb-uri>
ADMIN_EMAIL=<admin@example.com>

# CORS / client origin
CLIENT_URL=http://localhost:3000

# Email (Nodemailer)
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>
FROM_EMAIL="Auction App" <no-reply@auction.com>
client/.env

ini
Copy
Edit
REACT_APP_FIREBASE_API_KEY=<firebase-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<firebase-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<firebase-messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<firebase-app-id>

# Backend base URL (server host)
REACT_APP_API_URL=http://localhost:5000
The client Axios instance (src/api.js) automatically attaches the Firebase ID token to Authorization and uses REACT_APP_API_URL as base URL.

Install & Run
Backend

bash
Copy
Edit
cd server
npm install
npm start
Frontend

bash
Copy
Edit
cd client
npm install
npm start
By default:

Client runs at http://localhost:3000

Server runs at http://localhost:5000

Security
Auth boundary:

PrivateRoute protects all routes except /login and /register

AdminRoute restricts /admin to isAdmin (email equals ADMIN_EMAIL)

Backend:

verifyToken reads Authorization: Bearer <Firebase ID token>, verifies via Firebase Admin, and sets req.user = { uid, email, ... }

Validation:

Bids must be strictly greater than current price

Bidding disabled for isClosed or past endDate

New items require future endDate and valid basePrice

Real-Time Events
Socket.IO events

bidUpdate: emitted when a new highest bid is placed; clients update UI instantly

auctionEnded: emitted when an auction is auto-ended (endDate passed) or closed by admin

Email Notifications
Winner email (sendWinnerEmail) — sent when an auction is closed (auto or admin)

Outbid email (sendOutbidEmail) — sent to the previous highest bidder after a higher bid is accepted

Configured using Nodemailer with SMTP_* and FROM_EMAIL environment variables.
