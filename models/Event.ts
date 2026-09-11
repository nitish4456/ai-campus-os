import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  name: string;
  title?: string;
  description?: string;
  date?: Date;
  endDate?: Date;
  time?: string;
  location?: string;
  city?: string;
  category?: string;
  tags: string[];
  organizer?: string;
  registrationLink?: string;
  bookingUrl?: string;
  imageUrl?: string;
  source?: string;
  sourceUrl?: string;
  externalEventId?: string;
  isExternal?: boolean;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    time: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Technology',
    },
    tags: {
      type: [String],
      default: [],
    },
    organizer: {
      type: String,
      default: '',
    },
    registrationLink: {
      type: String,
      default: '',
    },
    bookingUrl: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'UniNest',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    externalEventId: {
      type: String,
      default: '',
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

EventSchema.index({ date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ city: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ source: 1, externalEventId: 1 });
EventSchema.index({ source: 1, name: 1, date: 1 });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
