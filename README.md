Silent Auction App
A full-stack JavaScript application for hosting and participating in silent auctions — built with React, Node.js, Express, MongoDB, Firebase Authentication, and Socket.IO.

Overview
The Silent Auction App allows registered users to:

View all active auctions in real-time

Place bids with live updates

Receive email notifications when they win or are outbid

Log in securely using Firebase Authentication

Admins can:

Create new auctions

Close auctions manually

Delete auctions

Automatically notify winners

Features
Authentication: Firebase Email/Password with JWT verification on backend

Real-Time Updates: Socket.IO for bid and auction status updates

Email Notifications: Nodemailer integration for winner and outbid alerts

Automatic Auction Closure: Checks endDate and closes auctions automatically

Responsive UI: Modular CSS per component

Project Structure
ruby
Copy
Edit
client/                      # React frontend
  ├─ public/                 # index.html, icons, manifest
  ├─ src/
  │   ├─ api.js              # Axios instance adding Firebase ID token + baseURL
  │   ├─ firebase.js         # Firebase client config (getAuth)
  │   ├─ contexts/
  │   │   └─ AuthContext.js  # Global auth provider (currentUser, isAdmin)
  │   ├─ components/
  │   │   ├─ Navbar.jsx
  │   │   └─ Navbar.module.css
  │   ├─ pages/
  │   │   ├─ Login.jsx
  │   │   ├─ Register.jsx
  │   │   ├─ AuctionList.jsx
  │   │   ├─ ItemDetails.jsx
  │   │   ├─ AdminDashboard.jsx
  │   ├─ assets/             # images, logos
  │   └─ utils/              # helpers
server/                      # Node.js backend
  ├─ models/
  │   ├─ AuctionItem.js      # Mongoose schema for auction items
  │   └─ Bid.js              # Mongoose schema for bids
  ├─ routes/
  │   └─ items.js            # Auction item and bid endpoints
  ├─ middlewares/
  │   └─ verifyToken.js      # Validates Firebase ID token
  ├─ utils/
  │   └─ email.js            # sendWinnerEmail, sendOutbidEmail
  └─ config/                 # DB connection & server setup
Front-End Component Map
php-template
Copy
Edit
<App>
 └─ <AuthProvider>               // Provides user state globally
     └─ <Router>
         ├─ "/login"    → <Login />            // Firebase login
         ├─ "/register" → <Register />         // Firebase signup
         ├─ "/"         → <PrivateRoute>
         │                 └─ <Navbar /> + <AuctionList /> + <TimeLeft />
         ├─ "/item/:id" → <PrivateRoute>
         │                 └─ <Navbar /> + <ItemDetails /> + <TimeLeft />
         └─ "/admin"    → <AdminRoute>
                           └─ <Navbar /> + <AdminDashboard />
API Endpoints
Public

GET /api/items → Get all auction items (auto-closes ended ones)

GET /api/items/:id → Get item details + bid history

Protected (requires verifyToken)

POST /api/items/:id/bid → Place bid (validates amount, emits bidUpdate)

PATCH /api/items/:id/close → Admin closes auction (sends winner email)

DELETE /api/items/:id → Admin deletes auction and bids

POST /api/items → Admin creates new auction

Real-Time Events
Socket.IO Events (client ↔ server):

bidUpdate → Broadcast when a new highest bid is placed

auctionEnded → Broadcast when an auction ends automatically or manually

Email Notifications
Winner: Sent on auction close (sendWinnerEmail)

Outbid: Sent when a user is outbid (sendOutbidEmail)

Security
Frontend:

PrivateRoute protects logged-in user routes

AdminRoute restricts /admin to ADMIN_EMAIL

Backend:

verifyToken middleware validates Firebase token and attaches req.user

Admin-only checks against process.env.ADMIN_EMAIL

Validation: Prevents bids lower than current price, disallows bidding after auction end, enforces valid endDate for new items

Installation
1. Clone
bash
Copy
Edit
git clone <repo-url>
cd silent-auction-app
2. Install
bash
Copy
Edit
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
3. Configure .env
Server .env
ini
Copy
Edit
PORT=5000
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<jwt-secret>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-app-password>
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=<admin-email>
FROM_EMAIL=<from-email>
Client .env
ini
Copy
Edit
REACT_APP_FIREBASE_API_KEY=<firebase-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<firebase-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<firebase-messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<firebase-app-id>
REACT_APP_API_URL=http://localhost:5000/api
4. Run
bash
Copy
Edit
# Backend
cd server
npm start

# Frontend
cd ../client
npm start
