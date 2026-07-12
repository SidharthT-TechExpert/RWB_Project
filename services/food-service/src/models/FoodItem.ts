import mongoose, { Document, Schema } from 'mongoose';

export interface IVariant {
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface IAddOn {
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface INutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface IFoodItem extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  restaurantId: string;
  categoryId: string;
  basePrice: number;
  variants: IVariant[];
  addOns: IAddOn[];
  images: string[];
  coverImage?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spiceLevel?: 1 | 2 | 3 | 4 | 5;
  allergens: string[];
  nutrition?: INutrition;
  preparationTime: number; // minutes
  isAvailable: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalOrders: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
});

const AddOnSchema = new Schema<IAddOn>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
});

const FoodItemSchema = new Schema<IFoodItem>(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true },
    description: { type: String, required: true, index: 'text' },
    restaurantId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true, index: true },
    basePrice: { type: Number, required: true, min: 0 },
    variants: [VariantSchema],
    addOns: [AddOnSchema],
    images: [{ type: String }],
    coverImage: { type: String },
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    spiceLevel: { type: Number, enum: [1, 2, 3, 4, 5] },
    allergens: [{ type: String }],
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
    },
    preparationTime: { type: Number, default: 20 },
    isAvailable: { type: Boolean, default: true, index: true },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

FoodItemSchema.index({ restaurantId: 1, slug: 1 }, { unique: true });
FoodItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);
