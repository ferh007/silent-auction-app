const express = require('express');
const router = express.Router();
const AuctionItem = require('../models/AuctionItem');
const Bid = require('../models/Bid');
const verifyToken = require('../middlewares/verifyToken');
const nodemailer = require('nodemailer');

// Get all auction items
router.get('/', async (req, res) => {
  try {
    const items = await AuctionItem.find().lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// Get one item by ID (including its bid history)
router.get('/:id', async (req, res) => {
  try {
    const item = await AuctionItem.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Item not found" });
    const bids = await Bid.find({ item: item._id }).sort({ timestamp: 1 }).lean();
    res.json({ item, bids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch item details" });
  }
});

// ✅ Place a bid on an item (protected)
router.post('/:id/bid', verifyToken, async (req, res) => {
  console.log('Bid attempt:', {
    itemId: req.params.id,
    user: req.user,
    amount: req.body.amount
  });
  
  const user = req.user;
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: "Bid amount is required and must be a number" });
  }

  try {
    const item = await AuctionItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.isClosed) {
      return res.status(400).json({ message: "Auction is closed" });
    }

    const bidAmount = parseFloat(amount);
    const currentPrice = item.currentPrice || item.basePrice;
    if (bidAmount <= currentPrice) {
      return res.status(400).json({ message: `Bid must be higher than current price ($${currentPrice})` });
    }

    const bid = await Bid.create({
      item: id,
      userId: user.uid,
      userEmail: user.email,
      amount: bidAmount,
      timestamp: new Date()
    });

    item.currentPrice = bidAmount;
    item.currentBidder = user.email;
    await item.save();

    // Safely emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('bidUpdate', {
        itemId: id,
        userEmail: user.email,
        amount: bidAmount,
        timestamp: bid.timestamp
      });
    } else {
      console.warn('Socket.IO not initialized');
    }

    return res.status(201).json({ message: "Bid placed", bidId: bid._id });
  } catch (err) {
    console.error('Detailed bid error:', err);
    res.status(500).json({ message: err.message || "Failed to place bid" });
  }
});

// ✅ Admin: Close an auction (protected)
router.patch('/:id/close', verifyToken, async (req, res) => {
  const user = req.user;
  const adminEmails = [process.env.ADMIN_EMAIL];

  if (!user || !adminEmails.includes(user.email)) {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  try {
    const item = await AuctionItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.isClosed) return res.status(400).json({ message: "Auction already closed" });

    const winningBid = await Bid.find({ item: item._id }).sort({ amount: -1, timestamp: 1 }).limit(1);
    let winnerEmail = null;

    if (winningBid.length > 0) {
      winnerEmail = winningBid[0].userEmail;
    }

    item.isClosed = true;
    item.winnerEmail = winnerEmail;
    await item.save();

    if (winnerEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: process.env.FROM_EMAIL || '"Auction App" <no-reply@auction.com>',
        to: winnerEmail,
        subject: `Congratulations! You won the auction for "${item.title}"`,
        text: `Dear bidder,\n\nCongratulations! Your bid of $${item.currentPrice} is the highest for "${item.title}".\n\nWe will contact you with further details.\n\nBest regards,\nSilent Auction Team`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Winner notification email sent to ${winnerEmail}`);
      } catch (emailErr) {
        console.error("Failed to send winner email:", emailErr);
      }
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to close auction" });
  }
});

module.exports = router;
