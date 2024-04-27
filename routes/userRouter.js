
const express = require('express');
const { logoutUser, loginUser, registerUser, bookmarks, getProfile, otherUsers, follow, unfollow } = require('../controllers/userController');
const isAuthenticated = require('../config/auth');
const router = express.Router();
// const userController = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/logout", logoutUser);
router.put("/bookmark/:id", isAuthenticated, bookmarks);
router.get("/profile/:id", isAuthenticated, getProfile);
router.get("/otheruser/:id", isAuthenticated, otherUsers);
router.post("/follow/:id", isAuthenticated, follow);
router.post("/unfollow/:id", isAuthenticated, unfollow);

module.exports = router;