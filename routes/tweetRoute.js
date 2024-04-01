const express = require('express');
const { createTweet, deleteTweet, handleLikeOrDislike, getAllTweets, getFollowingTweets } = require('../controllers/tweetController');
const isAuthenticated = require('../config/auth'); // Import the middleware
const router = express.Router();

// Route definition with isAuthenticated middleware
router.post('/create', isAuthenticated, createTweet);
router.delete('/delete/:id', isAuthenticated, deleteTweet);
router.put('/like/:id', isAuthenticated, handleLikeOrDislike);
router.get('/alltweets/:id', isAuthenticated, getAllTweets);
router.get('/follwingtweets/:id', isAuthenticated, getFollowingTweets);

module.exports = router;
