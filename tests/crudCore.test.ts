import { describe, it } from "node:test";
import assert from "node:assert";
import * as CrudCore from "../src/core/crud";

describe("CRUD Core Utilities & Types", () => {
  it("exports pagination utilities and normalizes page values correctly", () => {
    assert.strictEqual(CrudCore.normalizePage(undefined), 1);
    assert.strictEqual(CrudCore.normalizePage(0), 1);
    assert.strictEqual(CrudCore.normalizePage(-5), 1);
    assert.strictEqual(CrudCore.normalizePage("3"), 3);
    assert.strictEqual(CrudCore.normalizePage(5), 5);

    assert.strictEqual(CrudCore.normalizePageSize(undefined), 10);
    assert.strictEqual(CrudCore.normalizePageSize("25"), 25);
    assert.strictEqual(CrudCore.normalizePageSize(500, 10, 100), 100);

    const pagination = CrudCore.buildPagination("2", "15");
    assert.strictEqual(pagination.page, 2);
    assert.strictEqual(pagination.limit, 15);
    assert.strictEqual(pagination.skip, 15);
  });

  it("exports sorting utilities and normalizes sort values correctly", () => {
    const sortAsc = CrudCore.normalizeSort("name", "ASC");
    assert.strictEqual(sortAsc.sortBy, "name");
    assert.strictEqual(sortAsc.sortOrder, "asc");

    const built = CrudCore.buildSort("code", "desc");
    assert.strictEqual(built.sortBy, "code");
    assert.strictEqual(built.sortOrder, "desc");
    assert.deepStrictEqual(built.orderBy, { code: "desc" });
  });

  it("exports filter utilities and cleans filters correctly", () => {
    const rawFilters = {
      search: "test",
      isActive: true,
      emptyString: "",
      nullVal: null,
      undefVal: undefined,
    };
    const cleaned = CrudCore.cleanFilters(rawFilters);
    assert.deepStrictEqual(cleaned, { search: "test", isActive: true });

    const searchFilters = CrudCore.buildSearchFilters(" photo ", ["name", "code"]);
    assert.notStrictEqual(searchFilters, null);
    assert.strictEqual(searchFilters?.OR.length, 2);
  });

  it("exports response helpers and structures responses correctly", () => {
    const apiRes = CrudCore.createApiResponse({ id: "1" }, "Success");
    assert.strictEqual(apiRes.success, true);
    assert.strictEqual(apiRes.message, "Success");

    const paginatedRes = CrudCore.createPaginatedResponse([{ id: "1" }], 1, 10, 25);
    assert.strictEqual(paginatedRes.items.length, 1);
    assert.strictEqual(paginatedRes.pagination.totalPages, 3);
  });

  it("exports query key functions and factories", () => {
    const listKey = CrudCore.list("categories", { page: 1 });
    assert.deepStrictEqual(listKey, ["categories", "list", { page: 1 }]);

    const detailKey = CrudCore.detail("categories", "123");
    assert.deepStrictEqual(detailKey, ["categories", "detail", "123"]);

    const factoryKeys = CrudCore.createCrudQueryKeys("products");
    assert.deepStrictEqual(factoryKeys.all, ["products"]);
    assert.deepStrictEqual(factoryKeys.detail("p-1"), ["products", "detail", "p-1"]);
  });
});
