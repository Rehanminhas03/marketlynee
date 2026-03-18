import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Check if MongoDB is configured
 */
export function isMongoDBConfigured(): boolean {
  return !!MONGODB_URI && MONGODB_URI.length > 0;
}

/**
 * Connect to MongoDB database
 * Returns null if MongoDB is not configured
 */
async function connectToDatabase(): Promise<typeof mongoose | null> {
  // Return null if MongoDB is not configured (optional feature)
  if (!MONGODB_URI || MONGODB_URI.length === 0) {
    console.warn("MongoDB URI not configured. Database features disabled.");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
