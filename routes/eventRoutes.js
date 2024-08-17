const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// API endpoint to get all events registered by a user
router.get('/registered/:userId', eventController.getRegisteredEvents);

// API endpoint to add events for a particular interest
router.post('/create', eventController.createEvent);

// API endpoint to get all events for a particular interest
router.get('/by-interest/:interestId', eventController.getEventsByInterest);

// API endpoint to see all other participants of an event
router.get('/participants/:eventId', eventController.getEventParticipants);

// API endpoint to register for an event and send confirmation email
router.post('/register', eventController.registerForEvent);

// API endpoint to add friends
router.post('/add-friends', eventController.addFriends);

// API endpoint to cancel registration for an event
router.post('/cancel-registration', eventController.cancelRegistration);

// API endpoint to get all events
router.get('/all', eventController.getAllEvents);

// API endpoint to get details of a specific event
router.get('/details/:eventId', eventController.getEventDetails);

module.exports = router;
