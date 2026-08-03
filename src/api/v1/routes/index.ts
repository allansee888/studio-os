import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import roleRoutes from './roles';
import permissionRoutes from './permissions';
import cookieParser from 'cookie-parser';

export const v1Router = Router();

v1Router.use(cookieParser());

// Health endpoint
v1Router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/roles', roleRoutes);
v1Router.use('/permissions', permissionRoutes);
