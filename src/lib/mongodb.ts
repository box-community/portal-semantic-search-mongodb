import { MongoClient, Db } from "mongodb";
import { config } from "dotenv";
config({ path: ".env.local" });

const uri = process.env.MONGODB_URI!;
const dbName = "box_portal";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (db) {
    return db;
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
