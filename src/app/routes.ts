import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('./routes/index.tsx'),
  route('health', './routes/health.ts'),
  // 404
  route('*', './routes/not-found.tsx'),
] satisfies RouteConfig;
