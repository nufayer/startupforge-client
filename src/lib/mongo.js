import { MongoClient, ServerApiVersion } from "mongodb";

const dbName = "startup_forge_db";

let clientPromise;

function getUriOrThrow() {
  const uri = process.env.MONGO_DB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGO_DB_URI. Set it in your environment (.env.local) before starting the Next.js server."
    );
  }
  return uri;
}

function getClient() {
  if (!clientPromise) {
    const uri = getUriOrThrow();
    const client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb() {
  const client = await getClient();
  return client.db(dbName);
}

export const collections = {
  startups: "startups",
  opportunities: "opportunities",
  applications: "applications",
};
