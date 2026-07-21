import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodItem extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; slug: string; description: string;
  restaurantId: string; categoryId: string; basePrice: number;
  variants: { name: string; price: number; isAvailable: boolean }[];
  addOns: { name: string; price: number; isAvailable: boolean }[];
  images: string[]; coverImage?: string;
  isVegetarian: boolean; isVegan: boolean; isGlutenFree: boolean; isSpicy: boolean;
  spiceLevel?: 1 | 2 | 3 | 4 | 5; allergens: string[];
  nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number };
  preparationTime: number; isAvailable: boolean; isPopular: boolean; isFeatured: boolean;
  averageRating: number; totalOrders: number; tags: string[];
  createdAt: Date; updatedAt: Date;
}

const FoodItemSchema = new Schema<IFoodItem>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    restaurantId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true, index: true },
    basePrice: { type: Number, required: true, min: 0 },
    variants: [{ name: String, price: Number, isAvailable: { type: Boolean, default: true } }],
    addOns: [{ name: String, price: Number, isAvailable: { type: Boolean, default: true } }],
    images: [String], coverImage: String,
    isVegetarian: { type: Boolean, default: false }, isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false }, isSpicy: { type: Boolean, default: false },
    spiceLevel: { type: Number, enum: [1, 2, 3, 4, 5] }, allergens: [String],
    nutrition: { calories: Number, protein: Number, carbs: Number, fat: Number, fiber: Number },
    preparationTime: { type: Number, default: 20 }, isAvailable: { type: Boolean, default: true, index: true },
    isPopular: { type: Boolean, default: false }, isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 }, totalOrders: { type: Number, default: 0 }, tags: [String],
  },
  { timestamps: true }
);

FoodItemSchema.index({ restaurantId: 1, slug: 1 }, { unique: true });
FoodItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
export const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
