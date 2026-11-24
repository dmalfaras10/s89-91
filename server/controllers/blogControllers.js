const Blog = require('../models/Blog.js');
const { errorHandler } = require('../auth.js');

module.exports.addBlog = (req, res) => {
  if (!req.user) {
    return res.status(401).send({
      success: false,
      message: "Authentication required. Please log in."
    });
  } else if (!req.body || !req.body.title || !req.body.content) {
    return res.status(400).send({
      success: false,
      message: "Blog title and content are required."
    });
  } else {
    let newBlog = new Blog({
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      author: req.user.id || req.user._id
    });

    return newBlog.save()
      .then(blog => res.status(201).send({
        success: true,
        message: "Blog post created successfully",
        blog
      }))
      .catch(error => errorHandler(error, req, res));
  }
};

module.exports.getBlogs = (req, res) => {
  return Blog.find({})
    .then(blogs => {
      if (blogs.length > 0) {
        return res.status(200).send({
          success: true,
          blogs
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "No blog posts found."
        });
      }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getBlogById = (req, res) => {
  let blogId = req.params.blogId.replace(/^"+|"+$/g, "").trim();

  if (!blogId) {
    return res.status(400).send({
      success: false,
      message: "Invalid or missing blog ID."
    });
  } else {
    return Blog.findById(blogId)
      .then(blog => {
        if (blog) {
          return res.status(200).send({
            success: true,
            blog
          });
        } else {
          return res.status(404).send({
            success: false,
            message: "Blog post not found."
          });
        }
      })
      .catch(error => errorHandler(error, req, res));
  }
};

module.exports.updateBlog = (req, res) => {
  let blogId = req.params.blogId.replace(/^"+|"+$/g, "").trim();

  if (!req.user) {
    return res.status(401).send({
      success: false,
      message: "Authentication required. Please log in."
    });
  } else if (!blogId) {
    return res.status(400).send({
      success: false,
      message: "Invalid or missing blog ID."
    });
  } else if (!req.body) {
    return res.status(400).send({
      success: false,
      message: "Request body is required."
    });
  } else {
    let currentUserId = (req.user.id || req.user._id).toString();

    return Blog.findById(blogId)
      .then(blog => {
        if (!blog) {
          return res.status(404).send({
            success: false,
            message: "Blog post not found."
          });
        }

        if (blog.author.toString() !== currentUserId) {
          return res.status(403).send({
            success: false,
            message: "You are not authorized to update this blog post."
          });
        }

        let updatedBlog = {
          title: req.body.title,
          content: req.body.content,
          updatedDate: new Date()
        };

        return Blog.findByIdAndUpdate(
          blogId,
          updatedBlog,
          { returnDocument: 'after', runValidators: true }
        )
          .then(updated => {
            if (updated) {
              return res.status(200).send({
                success: true,
                message: "Blog post updated successfully",
                updatedBlog: updated
              });
            } else {
              return res.status(404).send({
                success: false,
                message: "Blog post not found."
              });
            }
          });
      })
      .catch(error => errorHandler(error, req, res));
  }
};

module.exports.deleteBlog = (req, res) => {
  let blogId = req.params.blogId.replace(/^"+|"+$/g, "").trim();

  if (!req.user) {
    return res.status(401).send({
      success: false,
      message: "Authentication required. Please log in."
    });
  } else if (!blogId) {
    return res.status(400).send({
      success: false,
      message: "Invalid or missing blog ID."
    });
  } else {
    let currentUserId = (req.user.id || req.user._id).toString();

    return Blog.findById(blogId)
      .then(blog => {
        if (!blog) {
          return res.status(404).send({
            success: false,
            message: "Blog post not found."
          });
        }

        let isAuthor = blog.author && blog.author.toString() === currentUserId;
        let isAdmin = req.user.isAdmin === true;

        if (!isAuthor && !isAdmin) {
          return res.status(403).send({
            success: false,
            message: "You are not authorized to delete this blog post."
          });
        }

        return Blog.findByIdAndDelete(blogId)
          .then(deletedBlog => {
            if (deletedBlog) {
              return res.status(200).send({
                success: true,
                message: "Blog post deleted successfully"
              });
            } else {
              return res.status(404).send({
                success: false,
                message: "Blog post not found."
              });
            }
          });
      })
      .catch(error => errorHandler(error, req, res));
  }
};

module.exports.addBlogComment = (req, res) => {
  let blogId = req.params.blogId.replace(/^"+|"+$/g, "").trim();

  if (!req.user) {
    return res.status(401).send({
      success: false,
      message: "Authentication required. Please log in."
    });
  } else if (!blogId) {
    return res.status(400).send({
      success: false,
      message: "Invalid or missing blog ID."
    });
  } else if (!req.body || !req.body.text || !req.body.text.trim()) {
    return res.status(400).send({
      success: false,
      message: "Comment text is required."
    });
  } else {
    let newComment = {
      user: req.user.id || req.user._id,
      text: req.body.text.trim()
    };

    return Blog.findByIdAndUpdate(
      blogId,
      { $push: { comments: newComment } },
      { returnDocument: 'after', runValidators: true }
    )
      .then(blog => {
        if (blog) {
          return res.status(201).send({
            success: true,
            message: "Comment added successfully",
            updatedBlog: blog
          });
        } else {
          return res.status(404).send({
            success: false,
            message: "Blog post not found."
          });
        }
      })
      .catch(error => errorHandler(error, req, res));
  }
};

module.exports.getBlogComments = (req, res) => {
  let blogId = req.params.blogId.replace(/^"+|"+$/g, "").trim();

  if (!blogId) {
    return res.status(400).send({
      success: false,
      message: "Invalid or missing blog ID."
    });
  } else {
    return Blog.findById(blogId)
      .then(blog => {
        if (blog) {
          return res.status(200).send({
            success: true,
            comments: blog.comments
          });
        } else {
          return res.status(404).send({
            success: false,
            message: "Blog post not found."
          });
        }
      })
      .catch(error => errorHandler(error, req, res));
  }
};