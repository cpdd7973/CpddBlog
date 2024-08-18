const Blog = require('../models/blog');

// Display all blogs
const blog_index = (req, res) => {
    Blog.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('blogs/index', { title: 'All Blogs', blogs: result, req: req });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error'); // Handle errors properly
        });
};

// Show details of a single blog
const blog_details = (req, res) => {
    const id = req.params.id;
    Blog.findById(id)
        .then(result => {
            if (result) {
                res.render('blogs/details', { blog: result, title: 'Blog Details', req: req });
            } else {
                res.status(404).render('404', { title: 'Blog not found', req: req });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error'); // Handle errors properly
        });
};

// Show the create blog form
const blog_create_get = (req, res) => {
    res.render('blogs/create', { title: 'Create a new Blog', req: req });
};

// Create a new blog post
const blog_create_post = (req, res) => {
    const blog = new Blog(req.body);
    blog.save()
        .then(result => {
            res.redirect('/blogs');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error'); // Handle errors properly
        });
};

// Delete a blog post
const blog_delete = (req, res) => {
    const id = req.params.id;
    Blog.findByIdAndDelete(id)
        .then(result => {
            if (result) {
                res.json({ redirect: '/blogs' });
            } else {
                res.status(404).render('404', { title: 'Blog not found', req: req });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error'); // Handle errors properly
        });
};

module.exports = {
    blog_index,
    blog_details,
    blog_create_get,
    blog_create_post,
    blog_delete
};
