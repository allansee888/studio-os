import { describe, it } from "node:test";
import assert from "node:assert";
import { productRepository } from "./product.repository";

describe("ProductRepository", () => {
  it("should be defined", () => {
    assert.ok(productRepository);
  });
});
