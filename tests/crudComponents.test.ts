import { describe, it } from "node:test";
import assert from "node:assert";
import * as CrudComponents from "../src/components/crud";

describe("CRUD Shared Components Library", () => {
  it("exports all required CRUD UI framework components", () => {
    assert.strictEqual(typeof CrudComponents.CrudPage, "function");
    assert.strictEqual(typeof CrudComponents.CrudToolbar, "function");
    assert.strictEqual(typeof CrudComponents.CrudTable, "function");
    assert.strictEqual(typeof CrudComponents.CrudPagination, "function");
    assert.strictEqual(typeof CrudComponents.CrudStatusBadge, "function");
    assert.strictEqual(typeof CrudComponents.CrudEmptyState, "function");
    assert.strictEqual(typeof CrudComponents.CrudLoadingState, "function");
    assert.strictEqual(typeof CrudComponents.CrudErrorState, "function");
  });
});
