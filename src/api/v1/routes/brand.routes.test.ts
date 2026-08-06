import { describe, it } from "node:test";
import assert from "node:assert";
import brandRoutes from "./brand.routes";

describe("BrandRoutes", () => {
  it("should be defined", () => {
    assert.ok(brandRoutes);
  });
});
