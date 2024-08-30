const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/user'); // Adjust the path to your User model
const { param } = require('../routes/blogRoutes');

const JWT_SECRET = process.env.JWT_SECRET; // Store your JWT secret in environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Set the user in the session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      coverPhoto: user.coverPhoto,
    };

    // Send the token and user details in the response
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, gender } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password || !confirmPassword || !gender) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    
    // Determine the avatar based on gender
    let avatar;
    switch (gender.toLowerCase()) { // Convert gender to lowercase for comparison
      case 'male':
        avatar = 'assets/man.png';
        break;
      case 'female':
        avatar = 'assets/woman.png';
        break;
      case 'other':
        avatar = 'assets/user.png';
        break;
      default:
        return res.status(400).json({ error: 'Invalid gender selected.' });
    }

    const newUser = new User({
      username,
      email,
      password: password,
      gender,
      avatar // Add avatar to the user model
    });

    await newUser.save();

    // Respond with success message
    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.logoutUser = (req, res) => {
  // Destroy the session to log the user out
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout. Please try again.' });
    }

    // Optionally clear the token from the client-side (if stored in a cookie)
    res.clearCookie('token');
    
     // Redirect to login page or homepage after logout
     res.redirect('/login');
  });
};

exports.updateUserBio = async (req, res) => {
  const userId = req.params.id; // Assuming the user ID is passed as a URL parameter
  let { bio } = req.body;
  console.log("userId", userId);
  console.log("bio", bio);
  // Validate bio length
  if (bio && bio.length > 500) {
    return res.status(400).json({ message: 'Bio must not exceed 500 characters' });
  }

  // Set bio to null if it's an empty string
  if (bio === '') {
    bio = null;
  }

  try {
    // Find user by ID and update their bio
    const user = await User.findByIdAndUpdate(
      userId,
      { bio },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.session.user.bio = bio || null;
    res.status(200).json({
      message: 'Bio updated successfully',
      user: req.session.user
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.params.id;

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars', // Optional: specify a folder in your Cloudinary account
      transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: apply transformations like resizing
    });

    // Update user's avatar field with the Cloudinary URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: result.secure_url },
      { new: true } // Return the updated document
    );
    req.session.user.avatar = result.secure_url || null;
    res.status(200).json({
      message: 'Avatar uploaded successfully!',
      user: req.session.user
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

exports.upload = upload;
