const express = require('express');
const {
  getUserProfile,
  updateProfile,
  followUser,
  getExploreUsers,
  searchUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/explore', protect, getExploreUsers);
router.get('/search', protect, searchUsers);
router.get('/:username', getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/:userId/follow', protect, followUser);

module.exports = router;