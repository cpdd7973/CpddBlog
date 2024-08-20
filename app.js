require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogRoutes');
const app = express();

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

// Middleware & static files
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.use('/blogs', blogRoutes);

app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'About Us',
        req: req  // Pass the req object to the template
    });
});


// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404', req: req });
});
