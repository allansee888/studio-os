import { describe, it } from "node:test";
import assert from "node:assert";
import { productService } from "./product.service";

describe("ProductService", () => {
  it("should be defined", () => {
    assert.ok(productService);
  });
});
