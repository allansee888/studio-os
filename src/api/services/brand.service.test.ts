import { describe, it } from "node:test";
import assert from "node:assert";
import { brandService } from "./brand.service";

describe("BrandService", () => {
  it("should be defined", () => {
    assert.ok(brandService);
  });
});
