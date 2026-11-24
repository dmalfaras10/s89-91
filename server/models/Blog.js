const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required'],
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    comments: [commentSchema],
  },
  {
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
  }
);

module.exports = mongoose.model('Blog', blogSchema);