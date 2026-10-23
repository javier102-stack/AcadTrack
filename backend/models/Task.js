
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  // The student who owns this task
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: 'General'
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    default: 'Medium'
  },
  taskType: {
    type: String,
    default: 'Assignment'
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
