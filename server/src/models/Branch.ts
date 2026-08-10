import mongoose, { Document, Schema } from 'mongoose';

export interface IBranchTable {
  tableNumber: string;
  capacity: number;
  type: 'indoor' | 'outdoor' | 'private' | 'bar';
  seatingCategory: 'regular' | 'family' | 'business' | 'vip' | 'couple';
  isAc?: boolean;
  description?: string;
  isAvailable: boolean;
  qrCodeToken: string;
  qrCodeUrl?: string;
}

export interface IBranch extends Document {
  _id: mongoose.Types.ObjectId;
  restaurantId: string;
  ownerId: string;
  name: string;
  code: string;
  managerId?: string;
  managerName?: string;
  phone: string;
  email?: string;
  qrCodeToken?: string;
  qrCodeUrl?: string;
  tables: IBranchTable[];
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: 'active' | 'inactive' | 'suspended';
  openingHours: { day: string; isOpen: boolean; openTime: string; closeTime: string }[];
  tablesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    restaurantId: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, index: true },
    managerId: { type: String, index: true },
    managerName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    qrCodeToken: { type: String, index: true },
    qrCodeUrl: { type: String },
    tables: [
      {
        tableNumber: { type: String, required: true },
        capacity: { type: Number, default: 4 },
        type: { type: String, enum: ['indoor', 'outdoor', 'private', 'bar'], default: 'indoor' },
        seatingCategory: { type: String, enum: ['regular', 'family', 'business', 'vip', 'couple'], default: 'regular' },
        isAc: { type: Boolean, default: true },
        description: { type: String },
        isAvailable: { type: Boolean, default: true },
        qrCodeToken: { type: String, index: true },
        qrCodeUrl: { type: String },
      },
    ],
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: 'NY' },
      country: { type: String, default: 'USA' },
      zipCode: { type: String, default: '10001' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [-73.9857, 40.7484] },
    },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    openingHours: [
      {
        day: { type: String },
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '22:00' },
      },
    ],
    tablesCount: { type: Number, default: 20 },
  },
  { timestamps: true }
);

BranchSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export const Branch = mongoose.model<IBranch>('Branch', BranchSchema);
