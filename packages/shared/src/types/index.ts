// Note: AuthenticatedRequest lives in middlewares/authenticate.ts
// Import it from there: import { AuthenticatedRequest } from '@quickbite/shared'

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  location?: GeoLocation;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

export interface OpeningHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface ContactInfo {
  phone: string;
  email?: string;
  website?: string;
}

export interface Image {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}
