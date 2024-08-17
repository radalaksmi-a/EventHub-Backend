const request = require('supertest');
const app = require('./app'); // Update this with the actual path

describe('User APIs', () => {
  it('should add a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        firstname: 'tester',
        lastname: 'test',
        email: 'tester@example.com',
        password:'tpass'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('userid');
    expect(response.body.firstname).toBe('tester');
  });

  it('should delete an existing user', async () => {
    // First, add a user to delete
    const addUserResponse = await request(app)
      .post('/api/users')
      .send({
        firstname: 'Hi',
        lastname: 'us',
        email: 'h@gmail.com',
        password:'hpass'
      });

    const userIdToDelete = addUserResponse.body.userid;

    // Now, delete the user
    const deleteUserResponse = await request(app)
      .delete(`/api/users/${userIdToDelete}`);

    expect(deleteUserResponse.statusCode).toBe(200);
    expect(deleteUserResponse.body).toHaveProperty('message', 'User deleted successfully');
  });
});
