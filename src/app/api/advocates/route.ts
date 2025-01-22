import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const offset = (page - 1) * limit;

  // 1) total count
  const [countResult] = await db
    .select({
      total: sql`COUNT(*)`.as("total"),
    })
    .from(advocates);

  const totalItems = Number(countResult.total);

  // 2) page data
  const data = await db.select().from(advocates).limit(limit).offset(offset);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  });
}
