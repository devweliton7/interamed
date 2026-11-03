// src/services/interactions/__tests__/mergeInteractions.test.ts

import { mergeInteraction } from "../mergeInteractions";

describe("mergeInteraction", () => {
  it("prioriza DDInter quando retorna gravidade válida", () => {
    const result = mergeInteraction(
      "varfarina",
      "aspirina",
      {
        drugA: "varfarina",
        drugB: "aspirina",
        severity: "Major",
        description: "Risco hemorrágico aumentado.",
      },
      null
    );
    expect(result.severity).toBe("grave");
    expect(result.source).toBe("ddinter");
  });

  it("cai para local quando DDInter não retorna dados", () => {
    const result = mergeInteraction("A", "B", null, {
      drugA: "A",
      drugB: "B",
      severity: "moderada",
      description: "Interação local.",
    });
    expect(result.severity).toBe("moderada");
    expect(result.source).toBe("local");
  });

  it("marca como não verificada quando nenhuma fonte responde", () => {
    const result = mergeInteraction("X", "Y", null, null);
    expect(result.severity).toBe("nao_verificada");
    expect(result.confidence).toBe("baixa");
  });
});