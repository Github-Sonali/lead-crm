import { describe, it, expect } from "vitest";
import { buyerCreateValidated } from "@/lib/validation";

describe("buyer budget validation", () => {
  it("rejects when budgetMax < budgetMin", () => {
    expect(() => buyerCreateValidated.parse({
      fullName: "A",
      phone: "1234567890",
      city: "Mohali",
      propertyType: "Plot",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: 5000000,
      budgetMax: 4000000
    })).toThrow();
  });

  it("requires bhk for Apartment", () => {
    expect(() => buyerCreateValidated.parse({
      fullName: "A B",
      phone: "1234567890",
      propertyType: "Apartment",
      city: "Chandigarh",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
    })).toThrow();
  });
});
