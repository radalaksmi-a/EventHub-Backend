const userModel = require('../models/userModel');

exports.addUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password} = req.body;

    const result = await userModel.addUser({ firstname, lastname, email ,password});

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addInterestsToUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const interest = parseInt(req.body.interest);
    
    // Check if userId and interest are valid numbers
    if (isNaN(userId) || isNaN(interest)) {
        throw new Error('Invalid userId or interest');
      }

    const result = await userModel.addInterestsToUser(userId, interest);

    res.json(result);
    console.log('Interest added', userId, interest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllInterestsOfUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await userModel.getAllInterestsOfUser(userId);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.removeInterestFromUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const interestId = parseInt(req.params.interestId);

    const result = await userModel.removeInterestFromUser(userId, interestId);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await userModel.deleteUser(userId);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await userModel.getUserDetails(userId);

    res.json(result);
    console.log('User details:', result);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUsersOfInterest = async (req, res) => {
  try {
    const interestId = req.params.interestId;

    const result = await userModel.getUsersOfInterest(interestId);

    res.json(result);
    console.log('Users of interest:', result);
  } catch (error) {
    console.error('Error fetching users of interest:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.changePassword = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await userModel.changePassword(userId, currentPassword, newPassword);

    res.json(result);
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
