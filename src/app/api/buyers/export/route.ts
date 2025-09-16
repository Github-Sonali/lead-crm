import prisma from "@/lib/prisma";
import { stringify } from "csv-stringify/sync";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const params = url.searchParams;

  const where: Record<string, unknown> = {};
  if (params.get("city")) where.city = params.get("city");
  if (params.get("propertyType")) where.propertyType = params.get("propertyType");
  if (params.get("status")) where.status = params.get("status");
  if (params.get("timeline")) where.timeline = params.get("timeline");
  if (params.get("q")) {
    const q = params.get("q")!;
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.buyer.findMany({ where, orderBy: { updatedAt: "desc" } });

  const csvRows = rows.map((r) => ({
    fullName: r.fullName,
    email: r.email ?? "",
    phone: r.phone,
    city: r.city,
    propertyType: r.propertyType,
    bhk: r.bhk ?? "",
    purpose: r.purpose,
    budgetMin: r.budgetMin ?? "",
    budgetMax: r.budgetMax ?? "",
    timeline: r.timeline,
    source: r.source,
    notes: r.notes ?? "",
    tags: Array.isArray(r.tags) ? r.tags.join(",") : (r.tags ? JSON.stringify(r.tags) : ""),
    status: r.status,
  }));

  const csv = stringify(csvRows, {
    header: true,
    columns: ["fullName","email","phone","city","propertyType","bhk","purpose","budgetMin","budgetMax","timeline","source","notes","tags","status"],
  });

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="buyers-export.csv"`,
    },
  });
}
