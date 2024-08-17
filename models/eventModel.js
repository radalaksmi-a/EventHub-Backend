// Import your PostgreSQL pool configuration
const axios = require('axios');
const { Pool } = require('pg');

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'root',
  port: 5432,
});

// Function to get all events registered by a user
exports.getRegisteredEvents = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT e.eventurl,e.eventid, e.eventname, e.city, e.eventdate FROM Eventregistration er JOIN event e ON er.eventid = e.eventid WHERE er.userid = $1',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching registered events:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to create an event
exports.createEvent = async (eventDetails) => {
  try {
    const { eventid,eventName, eventDate, city, interestId, details, pincode } = eventDetails;

    // Make API request to create an event on Eventbrite
    const eventbriteResponse = await axios.post(
      'https://www.eventbriteapi.com/v3/organizations/1970777776603/events/',
      {
        event: {
          name: { html: eventName },
          start: { timezone: 'Asia/Kolkata', utc: eventDate },
          end: { timezone: 'Asia/Kolkata', utc: eventDate },
          currency: 'USD'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const { name: eventbriteEventName, start: eventbriteEventStart } = eventbriteResponse.data;

    const formattedEventDate = new Date(eventbriteEventStart.utc).toISOString();

    // Insert event details into the 'event' table
    const eventResult = await pool.query(
      'INSERT INTO event (eventid, eventname, eventdate, city, interestid) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [eventid, eventbriteEventName.html, formattedEventDate, city, interestId]
    );

    // Insert event details into the 'eventdetails' table
    const eventDetailsResult = await pool.query(
      'INSERT INTO eventdetails (eventid, details) VALUES ($1, $2) RETURNING *',
      [eventid, details]
    );

    // Insert city and pincode mapping into the 'eventcitypincodemapping' table with ON CONFLICT
    const cityPincodeResult = await pool.query(
      'INSERT INTO eventcitypincodemapping (city, pincode) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [city, pincode]
    );

    return {
      event: eventResult.rows[0],
      eventDetails: eventDetailsResult.rows[0],
      cityPincodeMapping: cityPincodeResult.rows[0]
    };
  } catch (error) {
    console.error('Event creation error:', error.response?.data || error.message);
    console.error('Axios error details:', error.toJSON());
    throw new Error('Internal Server Error');
  }
};

// Function to get events by interest
exports.getEventsByInterest = async (interestId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM event WHERE interestid = $1',
      [interestId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching events by interest:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to get participants of an event
exports.getEventParticipants = async (eventId) => {
  try {
    const result = await pool.query(
      'SELECT u.firstname, u.lastname, u.email ' +
      'FROM users u ' +
      'JOIN eventregistration er ON u.userid = er.userid ' +
      'WHERE er.eventid = $1',
      [eventId]
    );

    const participants = result.rows.map(row => ({
      name: `${row.firstname} ${row.lastname}`,
      email: row.email,
    }));

    return participants;
  } catch (error) {
    console.error('Error fetching event participants:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to register for an event and send confirmation email
exports.registerForEvent = async (userId, eventId) => {
  try {
    const existingRegistration = await pool.query(
      'SELECT * FROM eventregistration WHERE userid = $1 AND eventid = $2',
      [userId, eventId]
    );

    if (existingRegistration.rows.length > 0) {
      return { message: 'User is already registered for the event' };
    }

    const registrationResult = await pool.query(
      'INSERT INTO eventregistration (userid, eventid) VALUES ($1, $2) RETURNING *',
      [userId, eventId]
    );

    await sendConfirmationEmail(userId, eventId);

    return registrationResult.rows[0];
  } catch (error) {
    console.error('User registration error:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to add friends
exports.addFriends = async (userid, eventid, friendUserIds) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE userid = $1', [userid]);
    const eventResult = await pool.query('SELECT * FROM event WHERE eventid = $1', [eventid]);

    if (userResult.rows.length === 0 || eventResult.rows.length === 0) {
      throw new Error('Invalid user or event.');
    }

    for (const friendUserId of friendUserIds) {
      await pool.query(
        'INSERT INTO userfriends (userid, friend_userid, eventid) VALUES ($1, $2, $3)',
        [userid, friendUserId, eventid]
      );
    }

    return { success: true, message: 'Friends added successfully.' };
  } catch (error) {
    console.error('Error adding friends:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to cancel registration for an event
exports.cancelRegistration = async (userid, eventid) => {
  try {
    const checkResult = await pool.query(
      'SELECT * FROM eventregistration WHERE userid = $1 AND eventid = $2',
      [userid, eventid]
    );

    if (checkResult.rows.length === 0) {
      throw new Error('Registration not found');
    }

    const result = await pool.query(
      'DELETE FROM eventregistration WHERE userid = $1 AND eventid = $2 RETURNING *',
      [userid, eventid]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Cancellation error:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to get all events
exports.getAllEvents = async () => {
  try {
    const result = await pool.query('SELECT * FROM Event');
    return result.rows;
  } catch (error) {
    console.error('Error fetching all events:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to get details of a specific event
exports.getEventDetails = async (eventId) => {
  try {
    const result = await pool.query('SELECT * FROM Event WHERE eventid = $1', [eventId]);

    if (result.rows.length === 0) {
      throw new Error('Event not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching event details:', error.message);
    throw new Error('Internal Server Error');
  }
};

// Function to send confirmation email
async function sendConfirmationEmail(userid, eventid) {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE userid = $1', [userid]);
    const eventResult = await pool.query('SELECT * FROM event WHERE eventid = $1', [eventid]);

    if (userResult.rows.length === 0) {
      console.error('User not found.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'radalakshmi.a.in@rupeek.com',
        pass: 'xnikvalxiddtwshh',
      },
    });

    const mailOptions = {
      from: 'radalakshmi.a.in@rupeek.com',
      to: userResult.rows[0].email,
      subject: 'Event Registration Confirmation',
      text: `Dear ${userResult.rows[0].firstname},\n\nThank you for registering for the event "${eventResult.rows[0].eventname}".\n\nEvent Details:\nDate: ${eventResult.rows[0].eventdate}\nLocation: ${eventResult.rows[0].city}\n\nWe look forward to seeing you there!\n\nBest regards,\nYour Event Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending confirmation email:', error.message);
  }
};
