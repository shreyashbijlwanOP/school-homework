import { ClassEnum, SubjectEnum } from '../types/index.js';
import { z } from 'zod';

export const queryValidation = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional(),
  select: z.string().optional().default(''),
  filter: z.any().optional().default({}),
});

export const idValidation = z.object({
  id: z.string(),
  select: z.string().optional().default('')
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  class: z.enum(Object.values(ClassEnum) as [string, ...string[]]),
  role: z.enum(['admin', 'student', 'superadmin']).default('student'),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string()
});

export const createHomeworkSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  assignDate: z.coerce.date(),
  class: z.enum(Object.values(ClassEnum) as [string, ...string[]]),
  subject: z.enum(Object.values(SubjectEnum) as [string, ...string[]]),
  daysToComplete: z.number().min(1),
  submissionURL: z.string().url(),
  FileType: z.string().min(1),
  assignedBy: z.string(),
});

export const updateHomeworkSchema = createHomeworkSchema.partial().extend({
  id: z.string()
});

export const createSubmissionSchema = z.object({
  studentId: z.string(),
  homeworkId: z.string(),
  submissionDate: z.coerce.date(),
  fileURL: z.string().url(),
  fileType: z.string().min(1),
  isCompleted: z.boolean().optional(),
  isCompletedInTime: z.boolean().optional()
});

export const updateSubmissionSchema = createSubmissionSchema.partial().extend({
  id: z.string()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});
