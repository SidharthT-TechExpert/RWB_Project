import mongoose, { Document, Schema } from 'mongoose';
import { ROLES, Role } from '@quickbite/shared';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role: Role;
    avatar?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isActive: boolean;
    isSuspended: boolean;
    googleId?: string;
    appleId?: string;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    passwordResetToken?: string;
    passwordResetExpiry?: Date;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    refreshTokens: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        phone: { type: String, sparse: true, index: true },
        password: { type: String, select: false },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.CUSTOMER,
        },
        avatar: { type: String },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isSuspended: { type: Boolean, default: false },
        googleId: { type: String, sparse: true },
        appleId: { type: String, sparse: true },
        emailVerificationToken: { type: String, select: false },
        emailVerificationExpiry: { type: Date, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpiry: { type: Date, select: false },
        lastLogin: { type: Date },
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date },
        refreshTokens: [{ type: String, select: false }],
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                const r = ret as Record<string, unknown>;
                delete r.password;
                delete r.refreshTokens;
                delete r.emailVerificationToken;
                delete r.passwordResetToken;
                return r;
            },
        },
    }
);

// Virtual for lock status
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
});

export const User = mongoose.model<IUser>('User', UserSchema);
