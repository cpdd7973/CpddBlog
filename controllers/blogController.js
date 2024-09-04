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
    let limit = parseInt(req.query.limit, 5);
    const userId = req.query.userId;

    // Set default values if parameters are not provided or invalid
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 5;

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
    console.log(blog)
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

    // Check if cover image is provided in the form data
    console.log(req.file,"req.file");
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
  blog_delete,
  getBlogs,
  upload
};
