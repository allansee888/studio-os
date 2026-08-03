import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import roleRoutes from './roles';
import permissionRoutes from './permissions';
import { healthRouter } from '../../routes/health.ts';
import cookieParser from 'cookie-parser';

export const v1Router = Router();

v1Router.use(cookieParser());

// Health endpoint
v1Router.use('/health', healthRouter);

v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/roles', roleRoutes);
v1Router.use('/permissions', permissionRoutes);
