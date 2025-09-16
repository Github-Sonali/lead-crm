// app/api/auth/demo/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // For demo: accept { id, name } or return default demo user
  const body = await req.json().catch(() => ({}));
  const user = {
    id: body?.id ?? "demo-user-1",
    name: body?.name ?? "Demo User",
    email: body?.email ?? "demo@example.com",
  };

  const cookieVal = encodeURIComponent(JSON.stringify(user));
  const res = NextResponse.json({ user });
  // set cookie for 7 days
  res.cookies.set({
    name: "demoUser",
    value: cookieVal,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
