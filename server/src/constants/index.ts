export const ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT_OWNER: 'restaurant_owner',
  ADMIN: 'admin',
  DELIVERY_PARTNER: 'delivery_partner',
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
  WALLET: 'wallet',
  CASH: 'cash',
} as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const RESTAURANT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const;
export type RestaurantStatus = (typeof RESTAURANT_STATUS)[keyof typeof RESTAURANT_STATUS];

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_READY: 'order_ready',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PROMOTION: 'promotion',
  GENERAL: 'general',
} as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  VERY_LONG: 86400,
} as const;
