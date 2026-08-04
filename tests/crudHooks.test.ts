import { describe, it } from "node:test";
import assert from "node:assert";
import * as CrudHooks from "../src/hooks/crud";

describe("CRUD Shared React Query Hooks", () => {
  it("exports all required generic CRUD hooks", () => {
    assert.strictEqual(typeof CrudHooks.useCrudList, "function");
    assert.strictEqual(typeof CrudHooks.useCrudItem, "function");
    assert.strictEqual(typeof CrudHooks.useCrudCreate, "function");
    assert.strictEqual(typeof CrudHooks.useCrudUpdate, "function");
    assert.strictEqual(typeof CrudHooks.useCrudDelete, "function");
  });
});
