import mongoose from 'mongoose';
import { ClassEnum, CollectionEnum, SubjectEnum } from '../types/index.js';

const userDefinition: mongoose.SchemaDefinition = {
  name: { type: String, required: true, uppercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, trim: true },
  class: { type: String, required: true, trim: true, enum: Object.values(ClassEnum) },
  role: { type: String, required: true, trim: true, enum: ['admin', 'student', 'superadmin'], default: 'student' }
};

const homeworkDefinition: mongoose.SchemaDefinition = {
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  assignDate: { type: Date, required: true },
  class: { type: String, required: true, trim: true, enum: Object.values(ClassEnum) },
  subject: { type: String, required: true, trim: true, enum: Object.values(SubjectEnum) },
  daysToComplete: { type: Number, required: true, default: 4 },
  submissionURL: { type: String, required: true, trim: true },
  FileType: { type: String, required: true, trim: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.user, required: true },
};

const submissionDefinition: mongoose.SchemaDefinition = {
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.student, required: true },
  homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.homework, required: true },
  submissionDate: { type: Date, required: true },
  fileURL: { type: String, required: true, trim: true },
  fileType: { type: String, required: true, trim: true },
  isCompleted: { type: Boolean, default: false },
  isCompletedInTime: { type: Boolean, default: false }
};

const userSchema = new mongoose.Schema(userDefinition, { timestamps: true });

const homeworkSchema = new mongoose.Schema(homeworkDefinition, { timestamps: true });

const submissionSchema = new mongoose.Schema(submissionDefinition, { timestamps: true });

export const User = mongoose.model(CollectionEnum.user, userSchema);
export const Homework = mongoose.model(CollectionEnum.homework, homeworkSchema);
export const Submission = mongoose.model(CollectionEnum.submission, submissionSchema);
