import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGO_DB_NAME;

let client;
let clientPromise;

// 判断是否在开发环境中运行
if (process.env.NODE_ENV === 'development') {
  // 在开发环境中，使用全局变量来避免多次创建连接
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, { useUnifiedTopology: true });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 在生产环境中直接创建一个 MongoClient 实例
  client = new MongoClient(uri, { useUnifiedTopology: true });
  clientPromise = client.connect();
}

// 创建一个连接数据库的函数
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(dbName);  // 使用从环境变量中获取的数据库名称
  return { db };
}
