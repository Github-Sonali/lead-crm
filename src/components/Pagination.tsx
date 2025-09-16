"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  total: number;
  pageSize: number;
};

function buildQuery(params: URLSearchParams, changes: Record<string, string | undefined>) {
  const next = new URLSearchParams(params.toString());
  Object.entries(changes).forEach(([k, v]) => {
    if (v == null || v === "") next.delete(k);
    else next.set(k, v);
  });
  return next.toString();
}

export default function Pagination({ page, total, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pages);

  function goto(p: number) {
    const qp = buildQuery(searchParams ?? new URLSearchParams(), { page: String(p) });
    router.push(`/buyers?${qp}`);
  }

  const visibleRange = 5;
  const start = Math.max(1, current - Math.floor(visibleRange / 2));
  const end = Math.min(pages, start + visibleRange - 1);
  const pageNumbers = [];
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center gap-2">
      <button onClick={() => goto(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous page">
        Prev
      </button>

      {start > 1 && (
        <>
          <button onClick={() => goto(1)}>1</button>
          {start > 2 && <span>…</span>}
        </>
      )}

      {pageNumbers.map((p) => (
        <button
          key={p}
          onClick={() => goto(p)}
          aria-current={p === current ? "page" : undefined}
          className={p === current ? "font-bold underline" : undefined}
        >
          {p}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span>…</span>}
          <button onClick={() => goto(pages)}>{pages}</button>
        </>
      )}

      <button onClick={() => goto(Math.min(pages, current + 1))} disabled={current === pages} aria-label="Next page">
        Next
      </button>

      <div className="ml-4 text-sm">Total: {total}</div>
    </nav>
  );
}
