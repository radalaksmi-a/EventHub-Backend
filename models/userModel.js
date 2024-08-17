// Import your PostgreSQL pool configuration
const { Pool } = require('pg');

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'root',
  port: 5432,
});


exports.addUser = async (userData) => {
  try {
    const { firstname, lastname, email ,password} = userData;

    const result = await pool.query(
      'INSERT INTO users (firstname, lastname, email,password) VALUES ($1, $2, $3) RETURNING *',
      [firstname, lastname, email, password]
    );

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error');
  }
};

exports.addInterestsToUser = async (userId, interestId) => {
  try {
    const result = await pool.query(
      'INSERT INTO user_interest (userid, interestid) VALUES ($1, $2) RETURNING *',
      [userId, interestId]
    );

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error');
  }
};

exports.getAllInterestsOfUser = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT interest.interestid, interest.interestname FROM user_interest ' +
      'JOIN interest ON user_interest.interestid = interest.interestid ' +
      'WHERE user_interest.userid = $1',
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error');
  }
};

exports.removeInterestFromUser = async (userId, interestId) => {
  try {
    const checkResult = await pool.query(
      'SELECT * FROM user_interest WHERE userid = $1 AND interestid = $2',
      [userId, interestId]
    );

    if (checkResult.rows.length === 0) {
      throw new Error('User or interest not found');
    }

    const result = await pool.query(
      'DELETE FROM user_interest WHERE userid = $1 AND interestid = $2 RETURNING *',
      [userId, interestId]
    );

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error');
  }
};

exports.deleteUser = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userExists = await client.query('SELECT * FROM users WHERE userid = $1 FOR UPDATE', [userId]);

    if (userExists.rows.length === 0) {
      throw new Error('User not found');
    }

    const hasInterests = await pool.query('SELECT * FROM user_interest WHERE userid = $1', [userId]);

    if (hasInterests.rows.length > 0) {
      await pool.query('DELETE FROM user_interest WHERE userid = $1', [userId]);
    }

    const hasRegistrations = await client.query('SELECT * FROM eventregistration WHERE userid = $1 FOR UPDATE', [userId]);

    if (hasRegistrations.rows.length > 0) {
      await client.query('DELETE FROM eventregistration WHERE userid = $1', [userId]);
    }

    await client.query('DELETE FROM users WHERE userid = $1', [userId]);

    await client.query('COMMIT');

    return { message: 'User deleted successfully' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    throw new Error('Internal Server Error');
  } finally {
    client.release();
  }
};

exports.getUserDetails = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT u.firstname, u.lastname, u.email, i.interestname, e.eventname ' +
      'FROM users u ' +
      'LEFT JOIN user_interest ui ON u.userid = ui.userid ' +
      'LEFT JOIN interest i ON ui.interestid = i.interestid ' +
      'LEFT JOIN eventregistration er ON u.userid = er.userid ' +
      'LEFT JOIN event e ON er.eventid = e.eventid ' +
      'WHERE u.userid = $1',
      [userId]
    );

    const fullName = `${result.rows[0].firstname} ${result.rows[0].lastname}`;

    const user = {
      name: fullName.trim(),
      email: result.rows[0].email,
      interests: [...new Set(result.rows.map(row => row.interestname).filter(interest => interest !== null))],
      registeredEvents: [...new Set(result.rows.map(row => row.eventname).filter(eventname => eventname !== null))],
    };

    return user;
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    throw new Error('Internal Server Error');
  }
};

exports.getUsersOfInterest = async (interestId) => {
  try {
    const result = await pool.query(
      'SELECT u.firstname, u.lastname, u.email ' +
      'FROM users u ' +
      'JOIN user_interest ui ON u.userid = ui.userid ' +
      'WHERE ui.interestid = $1',
      [interestId]
    );

    const users = result.rows.map(row => ({
      name: `${row.firstname} ${row.lastname}`,
      email: row.email,
    }));

    return users;
  } catch (error) {
    console.error('Error fetching users of interest:', error.message);
    throw new Error('Internal Server Error');
  }
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const currentPasswordQuery = await pool.query(
      'SELECT password FROM Users WHERE userid = $1',
      [userId]
    );

    if (currentPasswordQuery.rows.length === 0) {
      throw new Error('User not found.');
    }

    const storedPassword = currentPasswordQuery.rows[0].password;

    if (currentPassword === storedPassword) {
      await pool.query('UPDATE Users SET password = $1 WHERE userid = $2', [newPassword, userId]);
      return { success: true, message: 'Password changed successfully.' };
    } else {
      throw new Error('Invalid current password.');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    throw new Error('Internal Server Error');
  }
};
