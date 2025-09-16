import { Buyer } from "@prisma/client";

/**
 * Convert buyers list into CSV string
 */
export function buyersToCSV(buyers: Buyer[]): string {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Created At",
    "Updated At",
  ];

  const rows = buyers.map((b) => [
    b.id,
    b.name,
    b.email ?? "",
    b.phone ?? "",
    b.company ?? "",
    b.createdAt.toISOString(),
    b.updatedAt.toISOString(),
  ]);

  // Escape quotes and join into CSV string
  return [headers, ...rows]
    .map((row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}
