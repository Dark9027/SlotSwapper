const express = require('express');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const router = express.Router();

// GET /api/swaps/swappable-slots
router.get('/swappable-slots', async (req, res) => {
  try {
    const slots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: req.user._id },
    }).populate('userId', 'name').sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST /api/swaps/swap-request
router.post('/swap-request', async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  try {
    const mySlot = await Event.findOne({ _id: mySlotId, userId: req.user._id, status: 'SWAPPABLE' });
    const theirSlot = await Event.findOne({ _id: theirSlotId, status: 'SWAPPABLE', userId: { $ne: req.user._id } });
    if (!mySlot || !theirSlot) return res.status(400).json({ msg: 'Invalid slots' });

    const request = new SwapRequest({
      requesterUserId: req.user._id,
      requesteeUserId: theirSlot.userId,
      mySlotId,
      theirSlotId,
    });
    await request.save();

    await Event.updateOne({ _id: mySlotId }, { status: 'SWAP_PENDING' });
    await Event.updateOne({ _id: theirSlotId }, { status: 'SWAP_PENDING' });

    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// POST /api/swaps/swap-response/:requestId
router.post('/swap-response/:requestId', async (req, res) => {
  const { accept } = req.body;
  try {
    const request = await SwapRequest.findById(req.params.requestId).populate('mySlotId theirSlotId');
    if (!request || request.status !== 'PENDING') return res.status(400).json({ msg: 'Invalid request' });

    const isRequestee = request.requesteeUserId.toString() === req.user._id.toString();
    if (!isRequestee) return res.status(403).json({ msg: 'Not authorized' });

    if (!accept) {
      // Reject
      request.status = 'REJECTED';
      await request.save();
      await Event.updateOne({ _id: request.mySlotId._id }, { status: 'SWAPPABLE' });
      await Event.updateOne({ _id: request.theirSlotId._id }, { status: 'SWAPPABLE' });
      res.json({ msg: 'Rejected' });
    } else {
      // Accept - Transactional swap (simple; use transactions in prod)
      request.status = 'ACCEPTED';
      await request.save();

      // Swap owners
      const tempUserId = request.mySlotId.userId;
      await Event.updateOne({ _id: request.mySlotId._id }, { userId: request.theirSlotId.userId, status: 'BUSY' });
      await Event.updateOne({ _id: request.theirSlotId._id }, { userId: tempUserId, status: 'BUSY' });

      res.json({ msg: 'Accepted' });
    }
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// GET /api/swaps/incoming-requests
router.get('/incoming-requests', async (req, res) => {
  try {
    const requests = await SwapRequest.find({ requesteeUserId: req.user._id, status: 'PENDING' })
      .populate('mySlotId theirSlotId requesterUserId', 'title startTime endTime name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/swaps/outgoing-requests
router.get('/outgoing-requests', async (req, res) => {
  try {
    const requests = await SwapRequest.find({ requesterUserId: req.user._id, status: 'PENDING' })
      .populate('mySlotId theirSlotId requesteeUserId', 'title startTime endTime name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;