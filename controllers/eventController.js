const eventModel = require('../models/eventModel'); // Adjust the path accordingly

// Controller function to get all events registered by a user
exports.getRegisteredEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const registeredEvents = await eventModel.getRegisteredEvents(userId);
    res.json(registeredEvents);
  } catch (error) {
    console.error('Error in getRegisteredEvents:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to create an event
exports.createEvent = async (req, res) => {
  try {
    const eventDetails = req.body;
    const createdEvent = await eventModel.createEvent(eventDetails);
    res.json(createdEvent);
  } catch (error) {
    console.error('Error in createEvent:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to get events by interest
exports.getEventsByInterest = async (req, res) => {
  try {
    const { interestId } = req.params;
    const eventsByInterest = await eventModel.getEventsByInterest(interestId);
    res.json(eventsByInterest);
  } catch (error) {
    console.error('Error in getEventsByInterest:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to get participants of an event
exports.getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventParticipants = await eventModel.getEventParticipants(eventId);
    res.json(eventParticipants);
  } catch (error) {
    console.error('Error in getEventParticipants:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to register for an event and send confirmation email
exports.registerForEvent = async (req, res) => {
  try {
    const { userid, eventid } = req.body;
    const registrationResult = await eventModel.registerForEvent(userid, eventid);
    res.json(registrationResult);
  } catch (error) {
    console.error('Error in registerForEvent:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to add friends
exports.addFriends = async (req, res) => {
  try {
    const { userid, eventid, friendUserIds } = req.body;
    const addFriendsResult = await eventModel.addFriends(userid, eventid, friendUserIds);
    res.json(addFriendsResult);
  } catch (error) {
    console.error('Error in addFriends:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to cancel registration for an event
exports.cancelRegistration = async (req, res) => {
  try {
    const { userid, eventid } = req.body;
    const cancellationResult = await eventModel.cancelRegistration(userid, eventid);
    res.json(cancellationResult);
  } catch (error) {
    console.error('Error in cancelRegistration:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to get all events
exports.getAllEvents = async (req, res) => {
  try {
    const allEvents = await eventModel.getAllEvents();
    res.json(allEvents);
  } catch (error) {
    console.error('Error in getAllEvents:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function to get details of a specific event
exports.getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventDetails = await eventModel.getEventDetails(eventId);
    res.json(eventDetails);
  } catch (error) {
    console.error('Error in getEventDetails:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
