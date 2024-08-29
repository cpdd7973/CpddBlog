const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the blog schema
const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  snippet: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create the Blog model
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
