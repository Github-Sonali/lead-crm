import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const updated = await prisma.buyer.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ buyer: updated });
}
