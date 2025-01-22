import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const offset = (page - 1) * limit;

  const searchTerm = searchParams.get("search") ?? "";

  // We'll build a dynamic WHERE clause. If searchTerm is empty,
  // we won't filter; otherwise, we'll do OR matching on multiple columns.
  // For specialties (JSON), we can do `::text ILIKE '%term%'` to search.
  let whereClause = sql``; // empty by default

  if (searchTerm) {
    const lowerSearch = `%${searchTerm.toLowerCase()}%`;
    whereClause = sql`
      (
        lower(${advocates.firstName}) LIKE ${lowerSearch}
        OR lower(${advocates.lastName}) LIKE ${lowerSearch}
        OR lower(${advocates.city}) LIKE ${lowerSearch}
        OR lower(${advocates.degree}) LIKE ${lowerSearch}
        OR lower(${advocates.specialties}::text) LIKE ${lowerSearch}
      )
    `;
  }

  // 1) Count total with potential WHERE
  // Drizzle doesn't automatically chain `.where(...)` from raw SQL easily,
  // so we can do a sub-query approach or inline raw SQL.
  const countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(advocates);

  if (searchTerm) {
    countQuery.where(whereClause);
  }

  const [countResult] = await countQuery;
  const totalItems = Number(countResult?.total ?? 0);

  // 2) Fetch the page data with the same WHERE, plus limit/offset
  const dataQuery = db.select().from(advocates).limit(limit).offset(offset);

  if (searchTerm) {
    dataQuery.where(whereClause);
  }

  const data = await dataQuery;

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
