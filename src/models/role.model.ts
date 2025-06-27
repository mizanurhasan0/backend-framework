import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    description: string;
    permissions: string[];
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    permissions: [{
        type: String,
        required: true,
        enum: [
            // User permissions
            'user:read', 'user:create', 'user:update', 'user:delete',
            // Category permissions
            'category:read', 'category:create', 'category:update', 'category:delete', 'category:move',
            // Product permissions
            'product:read', 'product:create', 'product:update', 'product:delete',
            // Order permissions
            'order:read', 'order:create', 'order:update', 'order:delete', 'order:fulfill',
            // Admin permissions
            'admin:read', 'admin:create', 'admin:update', 'admin:delete',
            // System permissions
            'system:settings', 'system:backup', 'system:logs'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isDefault: 1 });

// Pre-save middleware to ensure only one default role
roleSchema.pre('save', async function (next) {
    if (this.isDefault) {
        await mongoose.model('Role').updateMany(
            { _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

export const Role = mongoose.model<IRole>('Role', roleSchema); 