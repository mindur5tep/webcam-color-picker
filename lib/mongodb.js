import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to store the client
  // This prevents the client from being repeatedly instantiated during hot reloading
  clientPromise = global._mongoClientPromise || (global._mongoClientPromise = client.connect());
} else {
  // In production, it's better to not use global variables
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db();  // You can specify your database name here
  return { db, client };
}
