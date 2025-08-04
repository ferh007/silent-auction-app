// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);  // for integrating Socket.io

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


// Socket.io setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: "*" }  // allow all origins for dev; restrict in production
});
io.on('connection', (socket) => {
  console.log('Client connected via socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  // (We'll emit events from server routes instead of handling socket events directly here for bids)
});

// Import routes
const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Auction API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
