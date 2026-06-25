export async function GET() {
  return Response.json({
    MONGO_DB_URI: !!process.env.MONGO_DB_URI,
    AUTH_DB_NAME: process.env.AUTH_DB_NAME ?? null,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? null,
  });
}

