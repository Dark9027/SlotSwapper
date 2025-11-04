const request = require('supertest');
const app = require('../server'); // Import the app
const mongoose = require('mongoose');

// Note: For full tests, use a test DB and mock users/events/requests.
// This is a skeleton; expand with factories like Faker.

describe('Swap API', () => {
  let token;
  let userId;
  let mySlotId;
  let theirSlotId;
  let requestId;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/slotswapper_test');
    // Create test user and login to get token
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test', email: 'test@example.com', password: 'pass' });
    userId = userRes.body.user.id;
    token = userRes.body.token;

    // Create slots
    const mySlotRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Slot', startTime: new Date(), endTime: new Date(Date.now() + 3600000), status: 'SWAPPABLE' });
    mySlotId = mySlotRes.body._id;

    // Assume another user/slot for theirSlot (simplified; create second user in full test)
    // ... (create theirSlot with different user)

    // Create request
    const reqRes = await request(app)
      .post('/api/swaps/swap-request')
      .set('Authorization', `Bearer ${token}`)
      .send({ mySlotId, theirSlotId });
    requestId = reqRes.body._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should accept a swap', async () => {
    const res = await request(app)
      .post(`/api/swaps/swap-response/${requestId}`)
      .set('Authorization', `Bearer ${token}`) // Assume requestee token
      .send({ accept: true })
      .expect(200);

    expect(res.body.msg).toBe('Accepted');
  });

  it('should reject a swap and revert statuses', async () => {
    // Setup new request...
    const res = await request(app)
      .post(`/api/swaps/swap-response/${requestId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ accept: false })
      .expect(200);
    expect(res.body.msg).toBe('Rejected');
  });
});