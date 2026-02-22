import { describe, expect, test } from "bun:test";

import { getAllIndexes, getProductIndexes, indexes } from "../src/indexes.js";

describe("indexes", () => {
  test("runa indexes have correct names", () => {
    expect(indexes.runa.projects.name).toBe("runa_projects");
    expect(indexes.runa.tasks.name).toBe("runa_tasks");
    expect(indexes.runa.comments.name).toBe("runa_comments");
  });

  test("backfeed indexes have correct names", () => {
    expect(indexes.backfeed.projects.name).toBe("backfeed_projects");
    expect(indexes.backfeed.submissions.name).toBe("backfeed_submissions");
  });

  test("arbor indexes have correct names", () => {
    expect(indexes.arbor.repositories.name).toBe("arbor_repositories");
    expect(indexes.arbor.users.name).toBe("arbor_users");
    expect(indexes.arbor.issues.name).toBe("arbor_issues");
  });

  test("all indexes have organization_id as filterable", () => {
    const allConfigs = getAllIndexes();
    for (const config of allConfigs) {
      expect(config.filterableAttributes).toContain("organization_id");
    }
  });

  test("all indexes have searchable attributes", () => {
    const allConfigs = getAllIndexes();
    for (const config of allConfigs) {
      expect(config.searchableAttributes?.length).toBeGreaterThan(0);
    }
  });
});

describe("getProductIndexes", () => {
  test("returns all runa indexes", () => {
    const runaIndexes = getProductIndexes("runa");
    expect(runaIndexes).toHaveLength(3);
    expect(runaIndexes.map((i) => i.name)).toEqual([
      "runa_projects",
      "runa_tasks",
      "runa_comments",
    ]);
  });

  test("returns all backfeed indexes", () => {
    const backfeedIndexes = getProductIndexes("backfeed");
    expect(backfeedIndexes).toHaveLength(2);
  });

  test("returns all arbor indexes", () => {
    const arborIndexes = getProductIndexes("arbor");
    expect(arborIndexes).toHaveLength(3);
  });
});

describe("getAllIndexes", () => {
  test("returns all defined indexes", () => {
    const allIndexes = getAllIndexes();
    // 3 runa + 2 backfeed + 3 arbor = 8
    expect(allIndexes).toHaveLength(8);
  });

  test("each index has a unique name", () => {
    const allIndexes = getAllIndexes();
    const names = allIndexes.map((i) => i.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});
