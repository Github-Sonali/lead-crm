import prisma from "@/lib/prisma";
import BuyerForm from "@/components/BuyerForm";

export default async function Page({ params }: { params: { id: string } }) {
  const buyer = await prisma.buyer.findUnique({ where: { id: params.id } });
  if (!buyer) return <div>Not found</div>;

  type BuyerHistory = {
    id: string;
    changedAt: Date;
    changedBy: string;
    diff: any;
    // add other fields if needed
  };

  const history: BuyerHistory[] = await prisma.buyerHistory.findMany({
    where: { buyerId: params.id },
    orderBy: { changedAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <BuyerForm buyer={buyer} />
      <h2>History</h2>
      <ul>
        {history.map((h: BuyerHistory) => (
          <li key={h.id}>
            <div>{new Date(h.changedAt).toLocaleString()} by {h.changedBy}</div>
            <pre>{JSON.stringify(h.diff, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
