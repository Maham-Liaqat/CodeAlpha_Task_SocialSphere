const express = require('express');
const {
  createComment,
  getComments,
  likeComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { validateComment } = require('../middleware/validation');

const router = express.Router();

router.get('/:postId/comments', getComments);
router.post('/:postId/comments', protect, validateComment, createComment);
router.post('/:commentId/like', protect, likeComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;