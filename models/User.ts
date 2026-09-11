import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  googleId?: string | null;
  name: string;
  email: string;
  skills: string[];
  interests: string[];
  bio?: string;
  projects: string[];
  profileImage?: string | null;
  googleImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
    },
    projects: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      default: null,
    },
    googleImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Delete model if cached to ensure schema fields are re-compiled
if (mongoose.models && mongoose.models.User) {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
