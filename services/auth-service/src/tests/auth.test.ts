import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

// Use a test database
const TEST_DB = process.env.MONGODB_URI_AUTH_TEST || 'mongodb://localhost:27017/quickbite_auth_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'test@quickbite.com',
        password: 'Test@1234',
        role: 'customer',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@quickbite.com');
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'User 2',
        email: 'test@quickbite.com',
        password: 'Test@1234',
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'User 2',
        email: 'test@quickbite.com',
        password: 'Test@1234',
      });
      expect(res.status).toBe(409);
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Weak User',
        email: 'weak@quickbite.com',
        password: 'password',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeAll(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Login Test',
        email: 'login@quickbite.com',
        password: 'Login@1234',
      });
    });

    it('should login successfully', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@quickbite.com',
        password: 'Login@1234',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@quickbite.com',
        password: 'WrongPass',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@quickbite.com',
        password: 'Login@1234',
      });
      token = res.body.data?.tokens?.accessToken;
    });

    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('login@quickbite.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should always return 200 (prevents email enumeration)', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'nonexistent@quickbite.com',
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Health check', () => {
    it('should return 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
