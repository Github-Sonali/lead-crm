"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";

const CITY_OPTIONS = ["", "Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"];
const PROPERTY_OPTIONS = ["", "Apartment", "Villa", "Plot", "Office", "Retail"];
const STATUS_OPTIONS = ["", "New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"];
const TIMELINE_OPTIONS = ["", "0-3m", "3-6m", ">6m", "Exploring"];

function buildQuery(params: URLSearchParams, changes: Record<string, string | undefined>) {
  const next = new URLSearchParams(params.toString());
  Object.entries(changes).forEach(([k, v]) => {
    if (v == null || v === "") next.delete(k);
    else next.set(k, v);
  });
  return next.toString();
}

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const qParam = searchParams?.get("q") ?? "";
  const cityParam = searchParams?.get("city") ?? "";
  const propertyParam = searchParams?.get("propertyType") ?? "";
  const statusParam = searchParams?.get("status") ?? "";
  const timelineParam = searchParams?.get("timeline") ?? "";
  const pageParam = searchParams?.get("page") ?? "1";

  const [q, setQ] = useState(qParam);
  const debouncedQ = useDebounce(q, 500);

  // keep local state in sync with URL
  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  function applyFilters(changes: Record<string, string | undefined>) {
    const next = buildQuery(searchParams ?? new URLSearchParams(), { ...changes, page: "1" });
    router.push(`/buyers?${next}`);
  }

  // run search only when debouncedQ changes
  useEffect(() => {
    if (debouncedQ !== qParam) {
      applyFilters({ q: debouncedQ || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  function clearAll() {
    router.push("/buyers");
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3 items-center">
      <div>
        <label className="sr-only">Search</label>
        <input
          aria-label="Search by name, phone or email"
          placeholder="Search name / phone / email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      <div>
        <label className="sr-only">City</label>
        <select
          value={cityParam}
          onChange={(e) => applyFilters({ city: e.target.value || undefined })}
          className="p-2 border rounded"
          aria-label="Filter by city"
        >
          {CITY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c === "" ? "All Cities" : c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="sr-only">Property type</label>
        <select
          value={propertyParam}
          onChange={(e) => applyFilters({ propertyType: e.target.value || undefined })}
          className="p-2 border rounded"
          aria-label="Filter by property type"
        >
          {PROPERTY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p === "" ? "All Types" : p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="sr-only">Status</label>
        <select
          value={statusParam}
          onChange={(e) => applyFilters({ status: e.target.value || undefined })}
          className="p-2 border rounded"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "" ? "All Status" : s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="sr-only">Timeline</label>
        <select
          value={timelineParam}
          onChange={(e) => applyFilters({ timeline: e.target.value || undefined })}
          className="p-2 border rounded"
          aria-label="Filter by timeline"
        >
          {TIMELINE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === "" ? "All Timelines" : t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          type="button"
          onClick={clearAll}
          className="p-2 border rounded bg-gray-50"
          aria-label="Clear filters"
        >
          Clear
        </button>
      </div>

      <div style={{ marginLeft: "auto" }}>
        <span className="text-sm">Page {pageParam}</span>
      </div>
    </div>
  );
}

