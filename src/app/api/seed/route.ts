// src/app/api/seed/route.ts
import db from "../../../db";
import { advocates } from "../../../db/schema";
// Import our new generator
import { generateAdvocates } from "../../../db/seed/advocates";

export async function POST() {
  // 1) Clear out any existing records
  await db.delete(advocates).execute();

  // 2) Generate 500 brand-new records
  const generatedData = generateAdvocates(500);

  // 3) Insert them into the DB
  const records = await db.insert(advocates).values(generatedData).returning();

  // 4) Return them in the response
  return Response.json({ advocates: records });
}
