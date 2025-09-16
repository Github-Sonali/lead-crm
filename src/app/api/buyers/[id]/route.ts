import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buyerUpdateSchema } from "@/lib/validation";
import { consumeRateLimit } from "@/lib/rateLimit";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const buyer = await prisma.buyer.findUnique({ where: { id: params.id } });
  if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ buyer });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? "ip";
  if (!(await consumeRateLimit(ip))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = buyerUpdateSchema.parse({ ...body, id: params.id });

    const existing = await prisma.buyer.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (parsed.updatedAt && new Date(parsed.updatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
      return NextResponse.json({ error: "Record changed, please refresh" }, { status: 409 });
    }

    const updates: Record<string, unknown> = {};
    const diff: Record<string, [unknown, unknown]> = {};
    for (const key of Object.keys(parsed)) {
      if (["id", "updatedAt"].includes(key)) continue;
      const newVal = (parsed as any)[key];
      if (newVal !== undefined && (existing as any)[key] !== newVal) {
        updates[key] = newVal;
        diff[key] = [(existing as any)[key] ?? null, newVal ?? null];
      }
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ buyer: existing });

    const result = await prisma.$transaction(async (tx) => {
      const b = await tx.buyer.update({
        where: { id: params.id },
        data: { ...updates, tags: updates.tags ?? existing.tags },
      });
      await tx.buyerHistory.create({
        data: { buyerId: params.id, changedBy: user.id, diff },
      });
      return b;
    });

    return NextResponse.json({ buyer: result });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.buyer.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.buyer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
