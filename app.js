require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path'); // Import the path module
const MongoStore = require('connect-mongo'); // Import connect-mongo
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Trust the proxy
app.set('trust proxy', true);

// Connect to MongoDB
const dbURI = process.env.DATABASE_URL;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(3000, () => {
      console.log("Listening on port 3000");
    });
  })
  .catch((err) => console.log("Error connecting to MongoDB: " + err));

// Register view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware & static files
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());

// Session middleware Production
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallbackSecretIfNotInEnv', // Provide a secret option
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: dbURI }), // Use MongoDB to store session data
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // Set session expiration to 24 hours
    secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS in production
    httpOnly: true, // Prevent access via JavaScript
    sameSite: 'Lax' // Prevent CSRF attacks
  }
}));

// Development session
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'fallbackSecretIfNotInEnv', // Provide a secret option
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: dbURI }), // Use MongoDB to store session data
//     cookie: { secure: process.env.NODE_ENV === 'production' } // Set to true if using HTTPS in production
// }));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Set logged-in user globally
  res.locals.currentUser = null; // Define `user` in res.locals
  res.locals.currentPath = req.originalUrl;   // Capture the current path
  next();
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.use('/blogs', blogRoutes);
app.use('/user', userRoutes);

app.get('/login', (req, res) => {
  res.render('authentication/login', {
    title: 'Login',
    req: req,
    user: req.session.user || null  // Pass user object from session
  });
});

app.get('/register', (req, res) => {
  res.render('authentication/signup', {
    title: 'Register',
    errorMessage: "Fill All Details",
    req: req,
    formData: {},
    user: req.session.user || null  // Pass user object from session
  });
});

// app.js
app.get('/home', (req, res) => {
  res.render('pages/about', {
    title: 'About Us',
    req: req,
    user: req.session.user || null  // Pass user info to the view
  });
});


// 404 page
app.use((req, res) => {
  res.status(404).render('pages/404', { title: '404', req: req, user: req.session.user || null });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', {
    title: 'Server Error',
    user: req.session.user || null,
    req: req
  });
});
