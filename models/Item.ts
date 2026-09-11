import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'lost' | 'found';
  itemName: string;
  description?: string;
  category?: string;
  location?: string;
  date?: Date;
  imageUrl?: string;
  contactPreference?: string;
  status: 'ACTIVE' | 'RETURNED' | 'REMOVED' | 'active' | 'returned' | 'removed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      default: 'lost',
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Other',
    },
    location: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    contactPreference: {
      type: String,
      default: 'email',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RETURNED', 'REMOVED', 'active', 'returned', 'removed', 'resolved'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index({ type: 1 });
ItemSchema.index({ status: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ location: 1 });
ItemSchema.index({ userId: 1 });

// Ensure Mongoose model is recompiled if schema updated
if (mongoose.models && mongoose.models.Item) {
  delete (mongoose.models as any).Item;
}

const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);

export default Item;
