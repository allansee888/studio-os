import { describe, it } from "node:test";
import assert from "node:assert";
import { CreateBrandSchema } from "./brand";

describe("BrandValidation", () => {
  it("should be defined", () => {
    assert.ok(CreateBrandSchema);
  });
});
