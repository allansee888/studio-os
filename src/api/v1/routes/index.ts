import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import roleRoutes from './roles';
import permissionRoutes from './permissions';
import categoryRoutes from './category.routes';
import unitRoutes from './unit.routes';
import brandRoutes from './brand.routes';
import productRoutes from "./product.routes";
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
v1Router.use('/categories', categoryRoutes);
v1Router.use('/catalog/categories', categoryRoutes);
v1Router.use('/units', unitRoutes);
v1Router.use('/catalog/units', unitRoutes);
v1Router.use('/brands', brandRoutes);
v1Router.use('/catalog/brands', brandRoutes);
v1Router.use("/products", productRoutes);
v1Router.use("/catalog/products", productRoutes);
