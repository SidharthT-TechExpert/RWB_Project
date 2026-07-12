import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

const TEST_DB = 'mongodb://localhost:27017/quickbite_restaurant_test';

beforeAll(async () => { await mongoose.connect(TEST_DB); });
afterAll(async () => { await mongoose.connection.dropDatabase(); await mongoose.connection.close(); });

describe('Restaurant Service', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('GET /api/v1/restaurants returns list', async () => {
    const res = await request(app).get('/api/v1/restaurants');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/restaurants/featured returns list', async () => {
    const res = await request(app).get('/api/v1/restaurants/featured');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/restaurants requires auth', async () => {
    const res = await request(app).post('/api/v1/restaurants').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });
});
