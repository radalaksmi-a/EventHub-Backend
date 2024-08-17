const userModel = require('../models/pageModel');

exports.Signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const signupResult = await userModel.Signup({ firstname, lastname, email, password });
    
    if (signupResult.success) {
      res.json(signupResult);
    } else {
      res.status(400).json(signupResult);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginResult = await userModel.Login(email, password);

    if (loginResult.success) {
      res.json(loginResult);
    } else {
      res.status(401).json(loginResult);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.Explore = async (req, res) => {
  try {
    const loggedInUserId = req.query.userId;

    const exploreResult = await userModel.Explore(loggedInUserId);

    if (exploreResult.error) {
      res.status(400).json(exploreResult);
    } else {
      res.json(exploreResult);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllInterests = async (req, res) => {
  try {
    const getAllInterestsResult = await userModel.getAllInterests();
    
    if (getAllInterestsResult.error) {
      res.status(400).json(getAllInterestsResult);
    } else {
      res.json(getAllInterestsResult);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
