const { Pool } = require('pg');

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'root',
  port: 5432,
});

exports.Signup = async (userData) => {
  try {
    const { firstname, lastname, email, password } = userData;

    // Check if the user with the given email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      // User with the same email already exists
      return { success: false, message: 'Email already in use' };
    } else {
      // Insert user details into the 'users' table
      const result = await pool.query(
        'INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
        [firstname, lastname, email, password]
      );

      return { success: true, message: 'User registered successfully' };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Internal Server Error' };
  }
};

exports.Login = async (email, password) => {
  try {
    // Check if the user exists in the 'users' table
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (result.rows.length > 0) {
      // User found, login successful
      return { success: true, message: 'Login successful', user: result.rows[0] };
    } else {
      // User not found or incorrect credentials
      return { success: false, message: 'Invalid credentials' };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Internal Server Error' };
  }
};

exports.Explore = async (loggedInUserId) => {
  try {
    // Get user interests
    const interestsResponse = await pool.query('SELECT interestid FROM user_interest WHERE userid = $1', [loggedInUserId]);
    const userInterests = interestsResponse.rows.map((row) => row.interestid);

    if (!userInterests || userInterests.length === 0) {
      return { error: 'No interests found for the user' };
    }

    // Fetch users who have at least one similar interest
    const result = await pool.query(
      'SELECT DISTINCT u.userid, u.firstname, u.lastname, u.email FROM users u ' +
        'JOIN user_interest ui ON u.userid = ui.userid ' +
        'WHERE ui.interestid IN (' + userInterests.map((_, index) => `$${index + 1}`).join(', ') + ') ' +
        'AND u.userid <> $' + (userInterests.length + 1), // Exclude the logged-in user
      [...userInterests, loggedInUserId]
    );

    const matchingUsers = result.rows;
    return { matchingUsers };
  } catch (error) {
    console.error(error);
    return { error: 'Internal Server Error' };
  }
};

exports.getAllInterests = async () => {
  try {
    const result = await pool.query('SELECT * FROM interest');
    const interests = result.rows.map((row) => ({
      interestId: row.interestid,
      interestName: row.interestname,
    }));
    return { interests };
  } catch (error) {
    console.error(error);
    return { error: 'Internal Server Error' };
  }
};
