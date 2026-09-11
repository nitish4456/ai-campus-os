import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
  _id: mongoose.Types.ObjectId;
  sourceItemId: mongoose.Types.ObjectId;
  targetItemId: mongoose.Types.ObjectId;
  score: number;
  reasons: string[];
  createdAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    sourceItemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    targetItemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reasons: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;
