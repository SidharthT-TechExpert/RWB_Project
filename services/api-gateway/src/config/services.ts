export interface ServiceConfig {
  name: string;
  url: string;
  prefix: string;
  requiresAuth: boolean;
  timeout: number;
}

export const services: ServiceConfig[] = [
  {
    name: 'auth',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    prefix: '/api/v1/auth',
    requiresAuth: false,
    timeout: 10000,
  },
  {
    name: 'users',
    url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    prefix: '/api/v1/users',
    requiresAuth: true,
    timeout: 10000,
  },
  {
    name: 'restaurants',
    url: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3003',
    prefix: '/api/v1/restaurants',
    requiresAuth: false,
    timeout: 15000,
  },
  {
    name: 'food',
    url: process.env.FOOD_SERVICE_URL || 'http://localhost:3004',
    prefix: '/api/v1/food',
    requiresAuth: false,
    timeout: 10000,
  },
  {
    name: 'bookings',
    url: process.env.BOOKING_SERVICE_URL || 'http://localhost:3005',
    prefix: '/api/v1/bookings',
    requiresAuth: true,
    timeout: 15000,
  },
  {
    name: 'orders',
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3006',
    prefix: '/api/v1/orders',
    requiresAuth: true,
    timeout: 15000,
  },
  {
    name: 'payments',
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3007',
    prefix: '/api/v1/payments',
    requiresAuth: true,
    timeout: 30000,
  },
  {
    name: 'reviews',
    url: process.env.REVIEW_SERVICE_URL || 'http://localhost:3008',
    prefix: '/api/v1/reviews',
    requiresAuth: false,
    timeout: 10000,
  },
  {
    name: 'search',
    url: process.env.SEARCH_SERVICE_URL || 'http://localhost:3009',
    prefix: '/api/v1/search',
    requiresAuth: false,
    timeout: 10000,
  },
  {
    name: 'location',
    url: process.env.LOCATION_SERVICE_URL || 'http://localhost:3010',
    prefix: '/api/v1/location',
    requiresAuth: false,
    timeout: 10000,
  },
  {
    name: 'notifications',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3011',
    prefix: '/api/v1/notifications',
    requiresAuth: true,
    timeout: 10000,
  },
  {
    name: 'admin',
    url: process.env.ADMIN_SERVICE_URL || 'http://localhost:3012',
    prefix: '/api/v1/admin',
    requiresAuth: true,
    timeout: 15000,
  },
  {
    name: 'analytics',
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3013',
    prefix: '/api/v1/analytics',
    requiresAuth: true,
    timeout: 15000,
  },
];
