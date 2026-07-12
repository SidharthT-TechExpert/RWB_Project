import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

const TEST_DB = 'mongodb://localhost:27017/quickbite_booking_test';

beforeAll(async () => { await mongoose.connect(TEST_DB); });
afterAll(async () => { await mongoose.connection.dropDatabase(); await mongoose.connection.close(); });

describe('Booking Service Health', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /api/v1/bookings - unauthorized', () => {
  it('should return 401 without auth token', async () => {
    const res = await request(app).post('/api/v1/bookings').send({
      restaurantId: new mongoose.Types.ObjectId().toString(),
      type: 'table',
      guestCount: 2,
      reservationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      reservationTime: '19:00',
    });
    expect(res.status).toBe(401);
  });
});
