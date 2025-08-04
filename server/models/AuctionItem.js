const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuctionItemSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },       // highest bid so far
  currentBidder: { type: String, default: null },    // email or id of highest bidder
  isClosed: { type: Boolean, default: false },
  winnerEmail: { type: String, default: null },      // set when closed
}, { timestamps: true });

module.exports = mongoose.model('AuctionItem', AuctionItemSchema);
