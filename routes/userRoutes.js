// /routes/pageRoutes.js

const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/add', userController.addUser);
router.put('/add-interests/:userId', userController.addInterestsToUser);
router.get('/getall-interest/:userId', userController.getAllInterestsOfUser);
router.put('/remove-interest/:userId/:interestId', userController.removeInterestFromUser);
router.delete('delete-user/:userId',userController.deleteUser)
router.get('/details/:userId',userController.getUserDetails)
router.get('/interests/:interestId',userController.getUsersOfInterest)
router.put('/change-password/:userId',userController.changePassword)

module.exports = router;