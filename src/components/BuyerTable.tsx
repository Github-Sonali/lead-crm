
"use client";
import React from "react";
import Link from "next/link";

export type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline: string;
  status: string;
  updatedAt: string;
};

type Props = {
  buyers: Buyer[];
  onStatusQuickChange?: (id: string, newStatus: string) => Promise<void> | void;
};

export default function BuyerTable({ buyers, onStatusQuickChange }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse" role="table" aria-label="Buyers table">
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Phone</th>
            <th className="text-left p-2">City</th>
            <th className="text-left p-2">Property</th>
            <th className="text-left p-2">Budget</th>
            <th className="text-left p-2">Timeline</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Updated At</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {buyers.length === 0 && (
            <tr>
              <td colSpan={9} className="p-4 text-center">
                No buyers found.
              </td>
            </tr>
          )}

          {buyers.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-2 align-top">{b.fullName}</td>
              <td className="p-2 align-top">{b.phone}</td>
              <td className="p-2 align-top">{b.city}</td>
              <td className="p-2 align-top">{b.propertyType}</td>
              <td className="p-2 align-top">
                {b.budgetMin ?? "-"} {b.budgetMin || b.budgetMax ? "—" : ""} {b.budgetMax ?? "-"}
              </td>
              <td className="p-2 align-top">{b.timeline}</td>
              <td className="p-2 align-top">
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span>{b.status}</span>
                  {onStatusQuickChange && (
                    <select
                      aria-label={`Change status for ${b.fullName}`}
                      defaultValue={b.status}
                      onChange={(e) => onStatusQuickChange(b.id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Visited">Visited</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Converted">Converted</option>
                      <option value="Dropped">Dropped</option>
                    </select>
                  )}
                </div>
              </td>
              <td className="p-2 align-top">{new Date(b.updatedAt).toLocaleString()}</td>
              <td className="p-2 align-top">
                <Link href={`/buyers/${b.id}`} aria-label={`View or edit ${b.fullName}`}>
                  View / Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
