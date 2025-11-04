const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requesterUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesteeUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mySlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  theirSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);