const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// GET /api/events - User's events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST /api/events - Create event
router.post('/', async (req, res) => {
  try {
    const event = new Event({ ...req.body, userId: req.user._id });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// PUT /api/events/:id - Update event (e.g., status)
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    await Event.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;