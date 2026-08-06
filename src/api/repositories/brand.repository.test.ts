import { describe, it } from "node:test";
import assert from "node:assert";
import { brandRepository } from "./brand.repository";

describe("BrandRepository", () => {
  it("should be defined", () => {
    assert.ok(brandRepository);
  });
});
