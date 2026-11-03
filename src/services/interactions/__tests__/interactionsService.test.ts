// src/services/interactions/__tests__/interactionsService.test.ts

import { pairCount } from "../interactionsService";

describe("pairCount", () => {
  it("calcula combinações n escolhe 2", () => {
    expect(pairCount(3)).toBe(3);
    expect(pairCount(5)).toBe(10);
    expect(pairCount(10)).toBe(45);
  });
});