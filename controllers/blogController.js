const Blog = require('../models/blog');
const User = require('../models/user');

// Display all blogs
const blog_index = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).exec();
    const user = req.session.user || null; // Retrieve user info from session

    res.render('blogs/index', {
      title: 'All Blogs',
      blogs: blogs,
      user: user,
      req: req
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error'); // Handle errors properly
  }
};

// Show details of a single blog
const blog_details = async (req, res) => {
  const id = req.params.id;
  try {
    const blog = await Blog.findById(id).exec();
    if (blog) {
      res.render('blogs/details', {
        blog: blog,
        title: 'Blog Details',
        user: req.session.user || null,  // Pass user info to the view
        req: req
      });
    } else {
      res.status(404).render('404', { title: 'Blog not found', req: req });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error'); // Handle errors properly
  }
};

// Show the create blog form
const blog_create_get = (req, res) => {
  res.render('blogs/create', {
    title: 'Create a new Blog',
    user: req.session.user || null,  // Pass user info to the view
    req: req
  });
};

// Create a new blog post
const blog_create_post = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' }); // Handle unauthorized access
    }

    const blog = new Blog(req.body);
    console.log(blog);
    await blog.save();
    res.status(200).json({ message: 'Blog post created successfully!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a blog post
const blog_delete = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Blog.findByIdAndDelete(id).exec();
    if (result) {
      res.json({ redirect: '/blogs' });
    } else {
      res.status(404).render('404', { title: 'Blog not found', req: req });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error'); // Handle errors properly
  }
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete
};
