"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Download helpers
 */
function buildQueryFromSearchParams(searchParams: URLSearchParams | null) {
  const qs = new URLSearchParams();
  if (!searchParams) return "";
  for (const [k, v] of Array.from(searchParams.entries())) {
    if (v == null || v === "") continue;
    qs.set(k, String(v));
  }
  return qs.toString();
}

function getFilenameFromContentDisposition(cd: string | null) {
  if (!cd) return null;
  // handle filename*=UTF-8''encoded or filename="name"
  const utf8Match = cd.match(/filename\*=UTF-8''([^;]+)/);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);
  const normalMatch = cd.match(/filename="([^"]+)"/) || cd.match(/filename=([^;]+)/);
  if (normalMatch) return normalMatch[1];
  return null;
}

export default function ExportPage() {
  const searchParamsHook = useSearchParams();
  // convert next/navigation SearchParams -> URLSearchParams for iteration
  const searchParams = typeof searchParamsHook?.toString === "function"
    ? new URLSearchParams(searchParamsHook.toString())
    : null;

  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const qs = buildQueryFromSearchParams(searchParams);
      const url = `/api/buyers/export${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const filename = getFilenameFromContentDisposition(cd) ?? "buyers-export.csv";

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      alert(err?.message ?? "Export failed");
    } finally {
      setLoading(false);
    }
  };

  const exportHref = `/api/buyers/export${buildQueryFromSearchParams(searchParams) ? `?${buildQueryFromSearchParams(searchParams)}` : ""}`;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Export Buyers</h1>
      <p className="mb-4">This exports the currently applied filters / search / sort as a CSV file.</p>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={loading}
          aria-disabled={loading}
          className="px-4 py-2 border rounded"
        >
          {loading ? "Preparing..." : "Download CSV"}
        </button>

        <a
          href={exportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 border rounded bg-gray-50"
        >
          Open in new tab
        </a>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Tip: apply filters on the <code>/buyers</code> page (search, city, propertyType, status, timeline)
        and then use this export page to download that filtered list.
      </div>
    </div>
  );
}
