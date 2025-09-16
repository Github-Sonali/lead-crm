"use client";

import BuyerTable, { Buyer } from "@/components/BuyerTable";

export default function BuyerTableWithActions({ buyers }: { buyers: Buyer[] }) {
  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/buyers/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    // Refresh UI (simple way)
    window.location.reload();
  }

  return <BuyerTable buyers={buyers} onStatusQuickChange={handleStatusChange} />;
}
