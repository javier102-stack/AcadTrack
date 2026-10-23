
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

// Test route
router.get('/test', (req, res) => {
  res.send('Task router is working!');
});

// GET only the logged-in user's tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a task for the logged-in user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, subject, dueDate, priority, taskType, completed } = req.body;

    const newTask = new Task({
      user: req.user._id,
      title,
      description,
      subject,
      dueDate,
      priority,
      taskType,
      completed
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE only a task owned by the logged-in user
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { user, _id, __v, ...updates } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: 'Task not found or you do not have permission to update it.'
      });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE only a task owned by the logged-in user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: 'Task not found or you do not have permission to delete it.'
      });
    }

    res.json({ message: 'Task successfully deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
