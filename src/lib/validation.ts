import { z } from "zod";

export const CityEnum = z.enum(["Chandigarh","Mohali","Zirakpur","Panchkula","Other"]);
export const PropertyTypeEnum = z.enum(["Apartment","Villa","Plot","Office","Retail"]);
export const BHKEnum = z.enum(["1","2","3","4","Studio"]);
export const PurposeEnum = z.enum(["Buy","Rent"]);
export const TimelineEnum = z.enum(["0-3m","3-6m",">6m","Exploring"]);
export const SourceEnum = z.enum(["Website","Referral","Walk_in","Call","Other"]);
export const StatusEnum = z.enum(["New","Qualified","Contacted","Visited","Negotiation","Converted","Dropped"]);

const phoneRegex = /^\d{10,15}$/;

export const buyerBase = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().nullable(),
  phone: z.string().regex(phoneRegex),
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: BHKEnum.optional().nullable(),
  purpose: PurposeEnum,
  budgetMin: z.preprocess((v) => v === "" ? undefined : Number(v), z.number().int().positive().optional()),
  budgetMax: z.preprocess((v) => v === "" ? undefined : Number(v), z.number().int().positive().optional()),
  timeline: TimelineEnum,
  source: SourceEnum,
  notes: z.string().max(1000).optional().nullable(),
  tags: z.preprocess((v) => {
    if (typeof v === "string") {
      // CSV provides comma string; convert to array
      return v.split(",").map(s => s.trim()).filter(Boolean);
    }
    return v;
  }, z.array(z.string()).optional().nullable()),
  status: StatusEnum.optional(),
});

export const buyerCreateSchema = buyerBase.extend({
  ownerId: z.string().optional(),
});

export const buyerUpdateSchema = buyerBase.extend({
  id: z.string().uuid(),
  updatedAt: z.string(), // client sends the current updatedAt string for concurrency check
}).partial(); 

// extra refinement: bhk required if propertyType is Apartment or Villa
export const buyerCreateValidated = buyerCreateSchema.refine((data) => {
  if (data.propertyType === "Apartment" || data.propertyType === "Villa") {
    return (data.bhk !== undefined && data.bhk !== null);
  }
  return true;
}, {
  message: "bhk is required for Apartment/Villa",
  path: ["bhk"],
}).refine((data) => {
  if (data.budgetMin != null && data.budgetMax != null) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, { message: "budgetMax must be ≥ budgetMin", path: ["budgetMax"] });

// CSV row schema (all fields as strings initially)
export const csvRowSchema = z.object({
  fullName: z.string(),
  email: z.string().optional().nullable(),
  phone: z.string(),
  city: z.string(),
  propertyType: z.string(),
  bhk: z.string().optional().nullable(),
  purpose: z.string(),
  budgetMin: z.string().optional().nullable(),
  budgetMax: z.string().optional().nullable(),
  timeline: z.string(),
  source: z.string(),
  notes: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

export type BuyerCreateInput = z.infer<typeof buyerCreateSchema>;
