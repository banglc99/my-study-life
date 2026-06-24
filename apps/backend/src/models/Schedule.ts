import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  breakDuration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
      index: true
    },
    title: { 
      type: String, 
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: 200
    },
    description: { 
      type: String,
      maxlength: 1000
    },
    startTime: { 
      type: Date, 
      required: [true, 'Please provide a start time']
    },
    endTime: { 
      type: Date, 
      required: [true, 'Please provide an end time']
    },
    subject: { 
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true
    },
    priority: { 
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    completed: { 
      type: Boolean, 
      default: false 
    },
    breakDuration: { 
      type: Number, 
      default: 5,
      min: 1,
      max: 60
    }
  },
  { timestamps: true }
);

// Index for efficient queries
scheduleSchema.index({ userId: 1, startTime: 1 });
scheduleSchema.index({ userId: 1, completed: 1 });

const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);
export default Schedule;
