import { describe, it } from "node:test";
import assert from "node:assert";
import { productController } from "./product.controller";

describe("ProductController", () => {
  it("should be defined", () => {
    assert.ok(productController);
  });
});
