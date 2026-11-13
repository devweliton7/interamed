// src/services/interactions/__tests__/mergeInteractions.test.ts
import { describe, it, expect } from 'vitest';
import { mergeInteraction } from '../mergeInteractions';

describe("mergeInteraction", () => {
  it("prioriza DDInter quando retorna gravidade válida", () => {
    const result = mergeInteraction(
      "Varfarina",
      "Ibuprofeno",
      { drugA: "Varfarina", drugB: "Ibuprofeno", severity: "Major", description: "Risco grave", evidenceLevel: "1" },
      { drugA: "Varfarina", drugB: "Ibuprofeno", severity: "moderada", description: "Teste local" }
    );
    expect(result.severity).toBe("grave");
    expect(result.source).toBe("ddinter");
    expect(result.confidence).toBe("alta");
  });

  it("cai para local quando DDInter não retorna dados", () => {
    const result = mergeInteraction(
      "Varfarina",
      "Ibuprofeno",
      null,
      { drugA: "Varfarina", drugB: "Ibuprofeno", severity: "moderada", description: "Teste local" }
    );
    expect(result.severity).toBe("moderada");
    expect(result.source).toBe("local");
  });

  it("marca como não verificada quando nenhuma fonte responde", () => {
    const result = mergeInteraction(
      "A",
      "B",
      null,
      null
    );
    expect(result.severity).toBe("nao_verificada");
    expect(result.confidence).toBe("baixa");
  });
});