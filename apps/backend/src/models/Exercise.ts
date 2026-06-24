import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  title: string;
  description: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving';
  difficulty: 'easy' | 'medium' | 'hard';
  questions: IQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

const questionSchema = new Schema<IQuestion>({
  question: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  type: { 
    type: String,
    enum: ['multiple-choice', 'short-answer', 'essay'],
    required: true
  },
  options: [{ 
    type: String,
    maxlength: 500
  }],
  correctAnswer: { 
    type: String, 
    required: true
  },
  points: { 
    type: Number, 
    required: true,
    min: 1
  },
  explanation: { 
    type: String,
    maxlength: 1000
  }
}, { _id: true });

const exerciseSchema = new Schema<IExercise>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
      index: true
    },
    subject: { 
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true
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
    type: { 
      type: String,
      enum: ['multiple-choice', 'short-answer', 'essay', 'problem-solving'],
      default: 'multiple-choice'
    },
    difficulty: { 
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    questions: [questionSchema],
    timeLimit: { 
      type: Number, 
      default: 30,
      min: 5,
      max: 180
    },
    passingScore: { 
      type: Number, 
      default: 70,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

// Index for efficient queries
exerciseSchema.index({ userId: 1, subject: 1 });
exerciseSchema.index({ userId: 1, difficulty: 1 });

const Exercise = mongoose.model<IExercise>('Exercise', exerciseSchema);
export default Exercise;
