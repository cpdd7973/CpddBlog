const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the blog schema
const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  snippet: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  author: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    rank: {
      type: String,
      default: 'Beginner',
    },
    avatar: {
      type: String,
      default: '/assets/user.png',
    },
  },
  category: {
    type: String,
    enum: [
      'Technology',
      'Travel',
      'Food & Drink',
      'Health & Wellness',
      'Lifestyle',
      'Business & Finance',
      'Entertainment',
      'Education',
    ],
    required: true, // Ensure category is always provided
  },
  blogCoverImage: {
    type: String,
    required: false,
    default: '/assets/default_image.png',
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
    },
  ],
}, { timestamps: true });

// Create the Blog model
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
