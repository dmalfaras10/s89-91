const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogControllers');
const { verify } = require("../auth");

router.post('/addBlogs', verify, blogController.addBlog);
router.get('/getBlogs', blogController.getBlogs);
router.get('/getBlogs/:blogId', blogController.getBlogById);
router.patch('/update/:blogId', verify, blogController.updateBlog);
router.delete('/delete/:blogId', verify, blogController.deleteBlog);
router.post('/addComment/:blogId', verify, blogController.addBlogComment);
router.get('/getComment/:blogId', blogController.getBlogComments);

module.exports = router;