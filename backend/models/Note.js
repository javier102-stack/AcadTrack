const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Note' },
  content: { type: String, default: '' },
  linkedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);