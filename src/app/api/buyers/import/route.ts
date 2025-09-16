import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { csvRowSchema, buyerCreateValidated } from "@/lib/validation";

async function getUserFromReq(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/demoUser=([^;]+)/);
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match[1])); } catch { return null; }
}

export async function POST(req: Request) {
  const user = await getUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  let rows;
  try {
    rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse CSV" }, { status: 400 });
  }

  if (rows.length > 200) return NextResponse.json({ error: "Max 200 rows allowed" }, { status: 400 });

  const errors: Array<{ row: number; message: string }> = [];
  const validRows: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      csvRowSchema.parse(row); // basic
      // convert types and reuse buyerCreateValidated (coerce numbers inside)
      const normalized = {
        fullName: row.fullName,
        email: row.email || null,
        phone: row.phone,
        city: row.city,
        propertyType: row.propertyType,
        bhk: row.bhk || null,
        purpose: row.purpose,
        budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
        budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
        timeline: row.timeline,
        source: row.source,
        notes: row.notes || null,
        tags: row.tags ? row.tags.split(",").map((s:any)=>s.trim()).filter(Boolean) : null,
        status: row.status || undefined,
      };
      buyerCreateValidated.parse(normalized);
      validRows.push(normalized);
    } catch (err: any) {
      errors.push({ row: i + 2, message: err?.message ?? String(err) }); // +2 for header + 1-index
    }
  }

  const inserted: string[] = [];
  if (validRows.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const r of validRows) {
        const b = await tx.buyer.create({
          data: {
            ...r,
            ownerId: user.id,
            tags: r.tags ?? null,
          }
        });
        await tx.buyerHistory.create({
          data: {
            buyerId: b.id,
            changedBy: user.id,
            diff: { created: b },
          }
        });
        inserted.push(b.id);
      }
    });
  }

  return NextResponse.json({ insertedCount: inserted.length, errors });
}
