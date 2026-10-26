const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const authMiddleware = require('../middleware/authMiddleware'); // 👈 Import your actual cookie auth middleware

// GET all notes for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    console.log("User Details", notes);
    res.json(notes);
  } catch (err) {
    console.error(err); // 👈 Check your terminal for the exact error log if it still fails
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// POST (Create a new note)
router.post('/', authMiddleware, async (req, res) => {
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
router.put('/:id', authMiddleware, async (req, res) => {
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
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;