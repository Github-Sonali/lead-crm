import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buyerCreateValidated } from "@/lib/validation";
import { consumeRateLimit } from "@/lib/rateLimit";
import { getUserFromRequest } from "@/lib/auth";

function parseQuery(qs: URLSearchParams) {
  const page = Number(qs.get("page") ?? "1");
  const pageSize = 10;
  return {
    page: Math.max(1, page),
    pageSize,
    city: qs.get("city") ?? undefined,
    propertyType: qs.get("propertyType") ?? undefined,
    status: qs.get("status") ?? undefined,
    timeline: qs.get("timeline") ?? undefined,
    search: qs.get("q") ?? undefined,
  };
}

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const { page, pageSize, city, propertyType, status, timeline, search } = parseQuery(url.searchParams);

  const where: Prisma.BuyerWhereInput = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? "ip";
  if (!(await consumeRateLimit(ip))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = buyerCreateValidated.parse(body);

    const created = await prisma.$transaction(async (tx) => {
      const b = await tx.buyer.create({
        data: {
          ...parsed,
          ownerId: user.id,
          tags: parsed.tags ?? null,
        },
      });
      await tx.buyerHistory.create({
        data: {
          buyerId: b.id,
          changedBy: user.id,
          diff: { created: b },
        },
      });
      return b;
    });

    return NextResponse.json({ buyer: created }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
