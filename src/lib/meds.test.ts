import { describe, it, expect } from "vitest";
import { distribute, getInteraction, validate } from "./meds";

describe("InteraMed rules", () => {
  it("Varfarina + Ibuprofeno é grave", () => {
    expect(getInteraction("Ibuprofeno", "Varfarina").severity).toBe("grave");
  });
  it("nunca antes das 10h e 2h entre interações", () => {
    const s = distribute(["Varfarina", "Ibuprofeno", "Omeprazol"]);
    expect(Math.min(...s.map((x) => x.minutes))).toBe(600);
    const v = s.find((x) => x.meds.includes("Varfarina"))!.minutes;
    const i = s.find((x) => x.meds.includes("Ibuprofeno"))!.minutes;
    expect(Math.abs(v - i)).toBeGreaterThanOrEqual(120);
    expect(validate(s)).toEqual([]);
  });
  it("alerta horário antes das 10h", () => {
    expect(validate([{ id: "a", minutes: 540, meds: ["Omeprazol"] }]).length).toBe(1);
  });
});
