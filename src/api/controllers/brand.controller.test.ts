import { describe, it } from "node:test";
import assert from "node:assert";
import { brandController } from "./brand.controller";

describe("BrandController", () => {
  it("should be defined", () => {
    assert.ok(brandController);
  });
});
