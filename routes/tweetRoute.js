const express = require('express');
const { createTweet, deleteTweet, handleLikeOrDislike } = require('../controllers/tweetController');
const isAuthenticated = require('../config/auth'); // Import the middleware
const router = express.Router();

// Route definition with isAuthenticated middleware
router.post('/create', isAuthenticated, createTweet);
router.delete('/delete/:id', isAuthenticated, deleteTweet);
router.put('/like/:id', isAuthenticated, handleLikeOrDislike);

module.exports = router;
