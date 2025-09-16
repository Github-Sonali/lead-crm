import prisma from "@/lib/prisma";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import BuyerTableWithActions from "./BuyerTableWithActions"; 
import { Buyer } from "@/components/BuyerTable";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Number(searchParams.page ?? 1);
  const pageSize = 10;

  const where: Record<string, any> = {};
  if (searchParams.city) where.city = searchParams.city;
  if (searchParams.propertyType) where.propertyType = searchParams.propertyType;
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.timeline) where.timeline = searchParams.timeline;

  if (searchParams.q) {
    where.OR = [
      { fullName: { contains: searchParams.q, mode: "insensitive" } },
      { phone: { contains: searchParams.q } },
      { email: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  const [total, buyersRaw] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const buyers: Buyer[] = buyersRaw.map((b) => ({
    id: b.id,
    fullName: b.fullName,
    phone: b.phone,
    city: String(b.city),
    propertyType: String(b.propertyType),
    budgetMin: b.budgetMin ?? undefined,
    budgetMax: b.budgetMax ?? undefined,
    timeline: String(b.timeline),
    status: String(b.status),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Buyers</h1>

      <FilterBar />

      <BuyerTableWithActions buyers={buyers} />

      <Pagination page={page} total={total} pageSize={pageSize} />
    </div>
  );
}
