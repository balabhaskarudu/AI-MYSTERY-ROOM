import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
try {
  await connectDatabase();
  app.listen(env.PORT, () => console.log(`Afterlight API listening on port ${env.PORT}`));
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
}
