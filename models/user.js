const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'], // Ensure these values match what your form sends
    required: true
  },
  avatar: {
    type: String,
    default: '/assets/user.png' // Default avatar if none is provided
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500, // Adjust the maximum length as needed
    default: null  // Set default value to null
  },
  rank: {
    type: String,
    default: 'Beginner' // Default rank or define it based on your logic
  },
  coverPhoto: {
    type: String, // URL or path to the cover photo image
    default: '/assets/default-cover.png' // Default cover photo if none is provided
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
