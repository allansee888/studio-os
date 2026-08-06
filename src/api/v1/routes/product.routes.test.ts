import { describe, it } from "node:test";
import assert from "node:assert";
import productRouter from "./product.routes";

describe("ProductRouter", () => {
  it("should be defined", () => {
    assert.ok(productRouter);
  });
});
