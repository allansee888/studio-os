import { describe, it } from "node:test";
import assert from "node:assert";
import { createProductSchema, updateProductSchema } from "./product";

describe("ProductValidation", () => {
  it("should be defined", () => {
    assert.ok(createProductSchema);
    assert.ok(updateProductSchema);
  });
});
