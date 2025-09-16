"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type RowError = { row: number; message: string };

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [insertedCount, setInsertedCount] = useState<number | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Select a file");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/buyers/import", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Import failed");
    } else {
      setErrors(json.errors ?? []);
      setInsertedCount(json.insertedCount ?? 0);
      // refresh list if needed
      router.refresh();
    }
  }

  return (
    <div>
      <h1>Import CSV</h1>
      <form onSubmit={onSubmit}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="submit">Upload</button>
      </form>

      {insertedCount !== null && <div>Inserted: {insertedCount}</div>}
      {errors.length > 0 && (
        <>
          <ul>{errors.map((er, i) => <li key={i}>Row {er.row}: {er.message}</li>)}</ul>
          <h3>Row errors</h3>
          <ul>{errors.map((er: RowError, i) => <li key={i}>Row {er.row}: {er.message}</li>)}</ul>
        </>
      )}
    </div>
  );
}
