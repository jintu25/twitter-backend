
const express = require('express');
const { logoutUser, loginUser, registerUser, bookmarks, getProfile, otherUsers } = require('../controllers/userController');
const isAuthenticated = require('../config/auth');
const router = express.Router();
// const userController = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/logout", logoutUser);
router.put("/bookmark/:id", isAuthenticated, bookmarks);
router.get("/profile/:id", isAuthenticated, getProfile);
router.get("/otheruser/:id", isAuthenticated, otherUsers);

module.exports = router;