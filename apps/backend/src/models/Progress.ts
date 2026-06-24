import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnswer {
  _id?: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  userAnswer: string;
  isCorrect: boolean;
  points: number;
}

const answerSchema = new Schema<IAnswer>({
  questionId: { 
    type: Schema.Types.ObjectId, 
    required: true
  },
  userAnswer: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  isCorrect: { 
    type: Boolean, 
    required: true
  },
  points: { 
    type: Number, 
    required: true,
    min: 0
  }
}, { _id: true });

const progressSchema = new Schema<IProgress>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
      index: true
    },
    exerciseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Exercise',
      required: true,
      index: true
    },
    answers: [answerSchema],
    score: { 
      type: Number, 
      required: true,
      min: 0
    },
    totalScore: { 
      type: Number, 
      required: true,
      min: 0
    },
    percentage: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100
    },
    passed: { 
      type: Boolean, 
      required: true
    },
    startedAt: { 
      type: Date, 
      required: true
    },
    completedAt: { 
      type: Date
    },
    timeSpent: { 
      type: Number, 
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

// Index for efficient queries
progressSchema.index({ userId: 1, exerciseId: 1 });
progressSchema.index({ userId: 1, createdAt: -1 });
progressSchema.index({ userId: 1, passed: 1 });

const Progress = mongoose.model<IProgress>('Progress', progressSchema);
export default Progress;
