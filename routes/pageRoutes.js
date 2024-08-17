// /routes/pageRoutes.js

const express = require('express');
const pageController = require('../controllers/pageController');

const router = express.Router();

router.post('/signup', pageController.Signup);
router.post('/login', pageController.Login);
router.get('/explore', pageController.Explore);
router.get('/get-interests', pageController.getAllInterests);


module.exports = router;