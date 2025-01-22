import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(request: NextRequest) {
  // 1) Parse query parameters from the request URL
  const { searchParams } = new URL(request.url);

  let page = parseInt(searchParams.get("page") ?? "1", 10);
  let limit = parseInt(searchParams.get("limit") ?? "10", 10);

  // Enforce minimum values
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  const offset = (page - 1) * limit;

  // 2) Count total records (for pagination info)
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(advocates);

  const totalItems = countResult.count;

  // 3) Fetch paginated records
  const data = await db.select().from(advocates).limit(limit).offset(offset);

  // 4) Return data + pagination details
  return NextResponse.json({
    data,
    pagination: {
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    },
  });
}
