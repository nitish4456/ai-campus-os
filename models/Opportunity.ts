import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOpportunity extends Document {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  requiredSkills: string[];
  tags: string[];
  category?: string;
  teamSize?: number;
  interestedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: '',
    },
    teamSize: {
      type: Number,
      default: 1,
    },
    interestedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

OpportunitySchema.index({ category: 1 });
OpportunitySchema.index({ requiredSkills: 1 });

const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity || mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);

export default Opportunity;
