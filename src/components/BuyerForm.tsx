"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerCreateSchema, buyerCreateValidated } from "@/lib/validation";
import type { BuyerCreateInput } from "@/lib/validation";
import { useRouter } from "next/navigation";

type Props = {
  defaultValues?: Partial<BuyerCreateInput>;
  mode?: "create" | "edit";
  onSuccess?: () => void;
  id?: string;
};

export default function BuyerForm({ defaultValues = {}, mode = "create", onSuccess, id }: Props) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Partial<BuyerCreateInput>>({
    resolver: zodResolver(buyerCreateValidated as any),
    defaultValues,
  });

  async function onSubmit(data: any) {
    try {
      if (mode === "create") {
        const res = await fetch("/api/buyers", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error("Failed to create");
        router.push("/buyers");
      } else if (mode === "edit" && id) {
        // include updatedAt from defaultValues if present
        const payload = { ...data, id, updatedAt: (defaultValues as any).updatedAt };
        const res = await fetch(`/api/buyers/${id}`, { method: "PUT", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
        if (res.status === 409) {
          alert("Record changed, please refresh");
          return;
        }
        if (!res.ok) throw new Error("Failed to update");
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      alert(err?.message ?? "Error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block">Full name</label>
        <input {...register("fullName")} />
        {errors.fullName && <p>{String(errors.fullName?.message)}</p>}
      </div>
      <div>
        <label>Email</label>
        <input {...register("email")} />
        {errors.email && <p>{String(errors.email?.message)}</p>}
      </div>
      <div>
        <label>Phone</label>
        <input {...register("phone")} />
        {errors.phone && <p>{String(errors.phone?.message)}</p>}
      </div>
      <div>
        <label>City</label>
        <select {...register("city")}>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Mohali">Mohali</option>
          <option value="Zirakpur">Zirakpur</option>
          <option value="Panchkula">Panchkula</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {/* Add remaining inputs similarly: propertyType, bhk (conditionally), purpose, budgetMin, budgetMax, timeline, source, notes, tags */}
      <div>
        <button type="submit" disabled={isSubmitting}>{mode === "create" ? "Create" : "Save"}</button>
      </div>
    </form>
  );
}
