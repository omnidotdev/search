import { describe, expect, test } from "bun:test";

import {
  batchDocuments,
  buildIndexName,
  buildTenantFilter,
  parseIndexName,
  validateTenantDocument,
  validateTenantDocuments,
  withTimestamps,
} from "../src/utils.js";

describe("validateTenantDocument", () => {
  test("passes with valid document", () => {
    expect(() =>
      validateTenantDocument({ id: "1", organization_id: "org_123" })
    ).not.toThrow();
  });

  test("throws on missing id", () => {
    expect(() =>
      validateTenantDocument({ organization_id: "org_123" })
    ).toThrow("missing required id field");
  });

  test("throws on missing organization_id", () => {
    expect(() => validateTenantDocument({ id: "1" })).toThrow(
      "missing required organization_id field"
    );
  });
});

describe("validateTenantDocuments", () => {
  test("passes with valid documents", () => {
    expect(() =>
      validateTenantDocuments([
        { id: "1", organization_id: "org_123" },
        { id: "2", organization_id: "org_123" },
      ])
    ).not.toThrow();
  });

  test("throws on invalid document in array", () => {
    expect(() =>
      validateTenantDocuments([
        { id: "1", organization_id: "org_123" },
        { id: "2" }, // missing organization_id
      ])
    ).toThrow("missing required organization_id field");
  });
});

describe("withTimestamps", () => {
  test("adds created_at and updated_at", () => {
    const doc = { id: "1", organization_id: "org_123" };
    const result = withTimestamps(doc);

    expect(result.id).toBe("1");
    expect(result.organization_id).toBe("org_123");
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
  });

  test("preserves existing created_at", () => {
    const existing = "2024-01-01T00:00:00.000Z";
    const doc = { id: "1", organization_id: "org_123", created_at: existing };
    const result = withTimestamps(doc);

    expect(result.created_at).toBe(existing);
    expect(result.updated_at).not.toBe(existing);
  });

  test("updates updated_at even if provided", () => {
    const existing = "2024-01-01T00:00:00.000Z";
    const doc = { id: "1", organization_id: "org_123", updated_at: existing };
    const result = withTimestamps(doc);

    expect(result.updated_at).not.toBe(existing);
  });
});

describe("buildTenantFilter", () => {
  test("builds organization-only filter", () => {
    const filter = buildTenantFilter("org_123");
    expect(filter).toBe('organization_id = "org_123"');
  });

  test("includes workspace filter", () => {
    const filter = buildTenantFilter("org_123", "ws_456");
    expect(filter).toBe(
      'organization_id = "org_123" AND workspace_id = "ws_456"'
    );
  });

  test("includes additional filters", () => {
    const filter = buildTenantFilter("org_123", undefined, ["status = active"]);
    expect(filter).toBe('organization_id = "org_123" AND (status = active)');
  });

  test("combines all filters", () => {
    const filter = buildTenantFilter("org_123", "ws_456", [
      "status = active",
      "priority > 5",
    ]);
    expect(filter).toBe(
      'organization_id = "org_123" AND workspace_id = "ws_456" AND (status = active) AND (priority > 5)'
    );
  });
});

describe("parseIndexName", () => {
  test("parses simple index name", () => {
    const { product, entity } = parseIndexName("runa_projects");
    expect(product).toBe("runa");
    expect(entity).toBe("projects");
  });

  test("handles multi-part entity names", () => {
    const { product, entity } = parseIndexName("arbor_pull_requests");
    expect(product).toBe("arbor");
    expect(entity).toBe("pull_requests");
  });

  test("throws on invalid format", () => {
    expect(() => parseIndexName("invalid")).toThrow(
      'Invalid index name "invalid"'
    );
  });
});

describe("buildIndexName", () => {
  test("builds index name", () => {
    expect(buildIndexName("runa", "projects")).toBe("runa_projects");
  });

  test("handles multi-part entity", () => {
    expect(buildIndexName("arbor", "pull_requests")).toBe(
      "arbor_pull_requests"
    );
  });
});

describe("batchDocuments", () => {
  test("returns single batch for small array", () => {
    const docs = [{ id: 1 }, { id: 2 }];
    const batches = batchDocuments(docs, 10);
    expect(batches).toHaveLength(1);
    expect(batches[0]).toEqual(docs);
  });

  test("splits into multiple batches", () => {
    const docs = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const batches = batchDocuments(docs, 10);

    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(10);
    expect(batches[1]).toHaveLength(10);
    expect(batches[2]).toHaveLength(5);
  });

  test("handles empty array", () => {
    const batches = batchDocuments([], 10);
    expect(batches).toHaveLength(0);
  });

  test("uses default batch size of 1000", () => {
    const docs = Array.from({ length: 2500 }, (_, i) => ({ id: i }));
    const batches = batchDocuments(docs);

    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(1000);
    expect(batches[1]).toHaveLength(1000);
    expect(batches[2]).toHaveLength(500);
  });
});
