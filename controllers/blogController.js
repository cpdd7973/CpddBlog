const Blog = require('../models/blog');
const cloudinary = require('cloudinary').v2; // Ensure Cloudinary is required at the top
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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
    folder: 'blogCoverImages',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webep'],
  },
});

const upload = multer({ storage: storage });

const getBlogs = async (req, res) => {
  try {
    // Extract and validate query parameters
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);
    const userId = req.query.userId;

    // Set default values if parameters are not provided or invalid
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    // Build the filter object based on whether userId is provided
    let filter = {};
    if (userId) {
      // Validate the userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send('Invalid user ID');
      }

      // Optionally, verify that the user exists
      const user = await User.findById(userId).exec();
      if (!user) {
        return res.status(404).render('404', { title: 'User Not Found' });
      }

      // Filter blogs by the author's ID
      filter['author._id'] = userId;
    }

    // Fetch blogs and total count in parallel for efficiency
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 }) // Sort blogs by creation date descending
        .skip(skip)
        .limit(limit)
        .exec(),
      Blog.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(totalBlogs / limit);

    // Adjust the current page if it exceeds the total number of pages
    if (page > totalPages && totalPages > 0) {
      page = totalPages;
      const newSkip = (page - 1) * limit;
      const newBlogs = await Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(newSkip)
        .limit(limit)
        .exec();

      return res.render('blogs/index', {
        title: 'All Blogs',
        blogs: newBlogs,
        currentPage: page,
        totalPages: totalPages,
        req: req,
        limit: limit,
        userId: userId,
      });
    }

    // Render the EJS template with the fetched data
    res.render('blogs/index', {
      title: 'All Blogs',
      blogs: blogs,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      req: req,
      userId: userId,
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).send('Internal Server Error');
  }
};

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

    let coverImageUrl = '/assets/default_image.png';

    if (req.file) {
      // Upload the cover image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'blogCoverImages',
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
      });
      coverImageUrl = result.secure_url; // Get the URL from Cloudinary
    }

    // Create the blog post object
    const blog = new Blog({
      ...req.body,
      blogCoverImage: coverImageUrl,
    });

    await blog.save();
    res.status(200).json({ message: 'Blog post created successfully!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a blog post
const blog_update_post = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const blogId = req.params.id;
    const existingBlog = await Blog.findById(blogId);

    if (!existingBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Ensure the user is the owner of the blog or an Admin
    if (existingBlog.author._id.toString() !== req.session.user.id && req.session.user.rank !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let coverImageUrl = existingBlog.blogCoverImage; // Keep the existing image

    // If a new cover image is uploaded, upload it to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'blogCoverImages',
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      });
      coverImageUrl = result.secure_url; // Update the cover image URL
    }

    // Update blog post details
    const updatedData = {
      title: req.body.title || existingBlog.title,
      snippet: req.body.snippet || existingBlog.snippet,
      body: req.body.body || existingBlog.body,
      blogCoverImage: coverImageUrl, // Use the updated or existing cover image URL
    };

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updatedData, { new: true });

    res.status(200).json({ message: 'Blog post updated successfully!', blog: updatedBlog });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const blog_edit_get = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).render('pages/404', { title: 'Blog Not Found', req: req });
    }

    // Ensure the logged-in user is the author of the blog or an Admin
    if (blog.author._id.toString() !== req.session.user.id && req.session.user.rank !== 'Admin') {
      return res.status(403).render('pages/404', { title: 'Forbidden', req: req });
    }

    res.render('blogs/edit', {
      title: 'Edit Blog',
      blog: blog,
      req: req,
      user: req.session.user,
    });
  } catch (err) {
    console.log('Error rendering the edit page:', err);
    res.status(500).send('Internal Server Error');
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

// Functionality for toggling likes
const toggle_like = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.session.user.id; // Assuming user ID is stored in the session

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const hasLiked = blog.likes.includes(userId);

    if (hasLiked) {
      // Unlike the blog
      blog.likes = blog.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like the blog
      blog.likes.push(userId);
    }

    await blog.save();
    res.status(200).json({
      message: hasLiked ? 'Unliked' : 'Liked',
      likesCount: blog.likes.length,
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get  blog by category
const getBlogsByCategory = async (req, res) => {
  try {
    const category = req.params.categoryName;

    // Fetch blogs that match the category
    const blogs = await Blog.find({ category }).populate('author._id', 'username avatar');

    // Render the category page and pass the blogs and category name
    res.render('pages/category', {
      title: `Category: ${category}`,
      req: req,
      user: req.session.user,
      blogs: blogs,
      category: category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching blogs');
  }
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
  getBlogs,
  blog_update_post,
  blog_edit_get,
  toggle_like,
  getBlogsByCategory,
  upload
};
