const express = require('express');
const blogController = require('../controllers/blogController');
const router = express.Router();

// Route to display all blogs
// router.get('/', blogController.blog_index);
router.get('/', blogController.getBlogs);

// Route to handle creating a new blog (requires authentication)
router.post('/createpost', blogController.upload.single('blogCoverImage'), blogController.blog_create_post);

// Route to handle updating a blog (requires authentication)
router.post('/edit/:id', blogController.upload.single('blogCoverImage'), blogController.blog_update_post); // Changed from blog_create_post to blog_update_post

// Route to display edit blog page
router.get('/edit/:id', blogController.blog_edit_get);

// Route to display the form for creating a new blog
router.get('/create', blogController.blog_create_get);

// Route to display details of a single blog
router.get('/:id', blogController.blog_details);

// Route to handle deleting a blog (requires authentication)
router.delete('/:id', blogController.blog_delete);

module.exports = router;
