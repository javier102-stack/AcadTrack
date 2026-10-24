const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Middleware to check authentication (similar to your existing auth checks)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next(); // Adjust based on your auth setup
  // If using passport or token-based auth, verify here
  next(); 
};

// GET all notes for the logged-in user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// POST (Create a new note)
router.post('/', async (req, res) => {
  try {
    const newNote = new Note({
      userId: req.user._id,
      title: req.body.title || 'Untitled Note',
      content: req.body.content || '',
      linkedTaskId: req.body.linkedTaskId || null,
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

// PUT (Update/Save an existing note)
router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        title: req.body.title,
        content: req.body.content,
        linkedTaskId: req.body.linkedTaskId,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: 'Error updating note' });
  }
});

// DELETE a note
router.delete('/:id', async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;