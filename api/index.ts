// Vercel serverless entry point — wraps the Express app
import serverModule from '../packages/server/dist/index.js';

const app =
	(serverModule as unknown as { default?: typeof serverModule }).default ??
	serverModule;

export default app;
