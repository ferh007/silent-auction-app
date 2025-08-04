const mongoose = require('mongoose'); // <-- Add this line
const { Schema } = mongoose;

const BidSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'AuctionItem', required: true },
  userId: { type: String, required: true },    // Firebase UID of bidder
  userEmail: { type: String, required: true }, // Email of bidder (for convenience)
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bid', BidSchema);
