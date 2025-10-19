const express = require('express');
const {
  createPost,
  getPosts,
  getUserPosts,
  getPost,
  likePost,
  deletePost,
  getLikedPosts
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePost } = require('../middleware/validation');

const router = express.Router();

router.get('/', protect, getPosts);
router.get('/liked/:userId', getLikedPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:postId', optionalAuth, getPost);
router.post('/', protect, validatePost, createPost);
router.post('/:postId/like', protect, likePost);
router.delete('/:postId', protect, deletePost);

module.exports = router;