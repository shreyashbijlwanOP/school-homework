import { t } from './trpc.js';
import {
  createUserSchema,
  idValidation,
  queryValidation,
  updateUserSchema,
  createHomeworkSchema,
  updateHomeworkSchema,
  createSubmissionSchema,
  updateSubmissionSchema,
  loginSchema,
  registerSchema
} from '../validation/index.js';
import { User, Homework, Submission } from '../models/index.js';
import { publicProcedure, router } from './trpc.js';
import jwt from 'jsonwebtoken';
export const userRouter = router({
  findAll: publicProcedure.input(queryValidation).query(async ({ ctx, input }) => {
    console.log('input', input);
    return User.find(input.filter)
      .sort(input.sort)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .select(input.select)
      .lean()
      .exec();
  }),
  findById: publicProcedure.input(idValidation).query(async ({ ctx, input }) => {
    return User.findById(input.id).select(input.select).lean().exec();
  }),
  create: publicProcedure.input(createUserSchema).mutation(async ({ ctx, input }) => {
    const user = new User(input);
    await user.save();
    return { message: 'User created successfully', user };
  }),
  update: publicProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
    const user = await User.findByIdAndUpdate(input.id, input, { new: true });
    return { message: 'User updated successfully', user };
  }),
  delete: publicProcedure.input(idValidation).mutation(async ({ ctx, input }) => {
    const user = await User.findByIdAndDelete(input.id);
    return { message: 'User deleted successfully', user };
  }),
  count: publicProcedure.query(async () => {
    return User.countDocuments();
  })
});
export const homeworkRouter = router({
  findAll: publicProcedure.input(queryValidation).query(async ({ ctx, input }) => {
    return Homework.find(input.filter)
      .sort(input.sort)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .select(input.select)
      .lean()
      .exec();
  }),
  findById: publicProcedure.input(idValidation).query(async ({ ctx, input }) => {
    return Homework.findById(input.id).select(input.select).lean().exec();
  }),
  create: publicProcedure.input(createHomeworkSchema).mutation(async ({ ctx, input }) => {
    const homework = new Homework(input);
    await homework.save();
    return { message: 'Homework created successfully', homework };
  }),
  update: publicProcedure.input(updateHomeworkSchema).mutation(async ({ ctx, input }) => {
    const homework = await Homework.findByIdAndUpdate(input.id, input, { new: true });
    return { message: 'Homework updated successfully', homework };
  }),
  delete: publicProcedure.input(idValidation).mutation(async ({ ctx, input }) => {
    const homework = await Homework.findByIdAndDelete(input.id);
    return { message: 'Homework deleted successfully', homework };
  }),
  count: publicProcedure.query(async () => {
    return Homework.countDocuments();
  })
});
export const submissionRouter = router({
  findAll: publicProcedure.input(queryValidation).query(async ({ ctx, input }) => {
    return Submission.find(input.filter)
      .sort(input.sort)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .select(input.select)
      .lean()
      .exec();
  }),
  findById: publicProcedure.input(idValidation).query(async ({ ctx, input }) => {
    return Submission.findById(input.id).select(input.select).lean().exec();
  }),
  create: publicProcedure.input(createSubmissionSchema).mutation(async ({ ctx, input }) => {
    const submission = new Submission(input);
    await submission.save();
    return { message: 'Submission created successfully', submission };
  }),
  update: publicProcedure.input(updateSubmissionSchema).mutation(async ({ ctx, input }) => {
    const submission = await Submission.findByIdAndUpdate(input.id, input, { new: true });
    return { message: 'Submission updated successfully', submission };
  }),
  delete: publicProcedure.input(idValidation).mutation(async ({ ctx, input }) => {
    const submission = await Submission.findByIdAndDelete(input.id);
    return { message: 'Submission deleted successfully', submission };
  }),
  count: publicProcedure.query(async () => {
    return Submission.countDocuments();
  })
});
export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (user.password !== input.password) {
      throw new Error('Invalid credentials');
    }
    // JWT logic
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role, class: user.class },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );
    return { message: 'Login successful', role: user.role, token };
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new Error('Email already registered');
    }
    const user = new User(input);
    await user.save();
    // JWT logic
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d'
    });
    return { message: 'Registration successful', user, token };
  })
});
export const appAouter = t.router({
  users: userRouter,
  submission: submissionRouter,
  homework: homeworkRouter,
  auth: authRouter
});

export type AppRouter = typeof appAouter;
