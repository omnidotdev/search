import { MeiliSearch as _ } from "meilisearch";
function h(e) {
  const { searchRules: t = ["*"], algorithm: a = "HS256", force: r = !1, ...i } = e;
  return { searchRules: t, algorithm: a, force: r, ...i };
}
const g = /^[0-9a-f]{8}\b(?:-[0-9a-f]{4}\b){3}-[0-9a-f]{12}$/i;
function m(e) {
  return g.test(e);
}
function f(e) {
  return btoa(typeof e == "string" ? e : JSON.stringify(e));
}
let l;
function y() {
  return l === void 0 && (l = typeof crypto > "u" ? import("./__vite-browser-external-l0sNRNKZ.js").then((e) => e.webcrypto) : Promise.resolve(crypto)), l;
}
const b = new TextEncoder();
async function A({ apiKey: e, algorithm: t }, a, r) {
  const i = await y(), n = await i.subtle.importKey(
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#raw
    "raw",
    b.encode(e),
    // https://developer.mozilla.org/en-US/docs/Web/API/HmacImportParams#instance_properties
    { name: "HMAC", hash: `SHA-${t.slice(2)}` },
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#extractable
    !1,
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#keyusages
    ["sign"]
  ), s = await i.subtle.sign("HMAC", n, b.encode(`${r}.${a}`));
  return btoa(String.fromCharCode(...new Uint8Array(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function w({ algorithm: e }) {
  return f({ alg: e, typ: "JWT" }).replace(/=/g, "");
}
function k({ searchRules: e, apiKeyUid: t, expiresAt: a }) {
  if (!m(t))
    throw new Error("the uid of your key is not a valid UUIDv4");
  const r = { searchRules: e, apiKeyUid: t };
  return a !== void 0 && (r.exp = typeof a == "number" ? a : (
    // To get from a Date object the number of seconds since Unix epoch, i.e. Unix timestamp:
    Math.floor(a.getTime() / 1e3)
  )), f(r).replace(/=/g, "");
}
function v() {
  if (typeof navigator < "u" && "userAgent" in navigator) {
    const { userAgent: t } = navigator;
    if (t.startsWith("Node") || t.startsWith("Deno") || t.startsWith("Bun") || t.startsWith("Cloudflare-Workers"))
      return;
  }
  const e = globalThis.process?.versions;
  if (!(e !== void 0 && Object.hasOwn(e, "node")))
    throw new Error("failed to detect a server-side environment; do not generate tokens on the frontend in production!\nuse the `force` option to disable environment detection, consult the documentation (Use at your own risk!)");
}
async function D(e) {
  const t = h(e);
  t.force || v();
  const a = k(t), r = w(t), i = await A(t, a, r);
  return `${r}.${a}.${i}`;
}
class T {
  client;
  constructor(t) {
    this.client = new _({
      host: t.host,
      apiKey: t.masterKey,
      timeout: t.timeout
    });
  }
  /**
   * Get the underlying MeiliSearch client for advanced operations.
   * Use with caution - prefer the wrapped methods for tenant safety.
   */
  get raw() {
    return this.client;
  }
  /**
   * Generate a tenant-scoped API key for frontend search.
   *
   * The generated key automatically filters all queries by organization_id,
   * preventing data leakage between tenants.
   *
   * @param config - Tenant key configuration
   * @returns JWT token for client-side search
   *
   * @example
   * ```ts
   * const tenantKey = await search.generateTenantKey({
   *   organizationId: "org_abc123",
   *   expiresAt: new Date(Date.now() + 3600_000), // 1 hour
   * });
   * // Send tenantKey to frontend for MeiliSearch client initialization
   * ```
   */
  async generateTenantKey(t) {
    const { organizationId: a, workspaceId: r, expiresAt: i, indexes: n } = t, s = [`organization_id = "${a}"`];
    r && s.push(`workspace_id = "${r}"`);
    const o = s.join(" AND "), d = n ? Object.fromEntries(
      n.map((c) => [c, { filter: o }])
    ) : { "*": { filter: o } }, u = (await this.client.getKeys()).results.find(
      (c) => c.actions.includes("search") && c.actions.length === 1
    );
    if (!u)
      throw new Error(
        "No search-only API key found. Create one in Meilisearch with search action."
      );
    return D({
      apiKey: u.key,
      apiKeyUid: u.uid,
      searchRules: d,
      expiresAt: i ?? new Date(Date.now() + 36e5)
    });
  }
  /**
   * Get an index reference for document operations.
   *
   * @param indexName - Index name (e.g., "runa_projects")
   * @returns Index reference
   */
  index(t) {
    return this.client.index(t);
  }
  /**
   * Create or update an index with configuration.
   *
   * @param config - Index configuration
   *
   * @example
   * ```ts
   * await search.configureIndex({
   *   name: "runa_projects",
   *   searchableAttributes: ["name", "description", "tags"],
   *   filterableAttributes: ["organization_id", "workspace_id", "status", "owner_id"],
   *   sortableAttributes: ["created_at", "updated_at", "name"],
   * });
   * ```
   */
  async configureIndex(t) {
    const { name: a, primaryKey: r = "id", ...i } = t;
    await this.client.createIndex(a, { primaryKey: r });
    const n = this.client.index(a);
    if (i.searchableAttributes && await n.updateSearchableAttributes(i.searchableAttributes), i.filterableAttributes) {
      const s = i.filterableAttributes.includes(
        "organization_id"
      ) ? i.filterableAttributes : ["organization_id", ...i.filterableAttributes];
      await n.updateFilterableAttributes(s);
    } else
      await n.updateFilterableAttributes(["organization_id"]);
    i.sortableAttributes && await n.updateSortableAttributes(i.sortableAttributes), i.displayedAttributes && await n.updateDisplayedAttributes(i.displayedAttributes), i.rankingRules && await n.updateRankingRules(i.rankingRules), i.stopWords && await n.updateStopWords(i.stopWords), i.synonyms && await n.updateSynonyms(i.synonyms), i.distinctAttribute && await n.updateDistinctAttribute(i.distinctAttribute), i.typoTolerance && await n.updateTypoTolerance(i.typoTolerance);
  }
  /**
   * Add or update documents in an index.
   * Validates that all documents have organization_id.
   *
   * @param indexName - Target index
   * @param documents - Documents to index (must include organization_id)
   * @returns Indexing task
   */
  async addDocuments(t, a) {
    for (const r of a)
      if (!r.organization_id)
        throw new Error(
          `Document ${r.id} missing required organization_id field`
        );
    return this.client.index(t).addDocuments(a);
  }
  /**
   * Delete documents from an index.
   *
   * @param indexName - Target index
   * @param documentIds - IDs to delete
   * @returns Deletion task
   */
  async deleteDocuments(t, a) {
    return this.client.index(t).deleteDocuments(a);
  }
  /**
   * Search with automatic tenant scoping.
   * Use this for server-side search where you control the organization context.
   *
   * @param indexName - Index to search
   * @param query - Search query
   * @param organizationId - Organization to scope results to
   * @param options - Additional search options
   * @returns Search results
   */
  async searchTenant(t, a, r, i = {}) {
    const { filter: n, ...s } = i, o = `organization_id = "${r}"`;
    let d;
    return n ? typeof n == "string" ? d = `(${n}) AND ${o}` : d = [...n, o] : d = o, this.client.index(t).search(a, {
      ...s,
      filter: d
    });
  }
  /**
   * Get index statistics.
   *
   * @param indexName - Index name
   * @returns Index stats
   */
  async getIndexStats(t) {
    return this.client.index(t).getStats();
  }
  /**
   * Check if Meilisearch is healthy.
   *
   * @returns Health status
   */
  async health() {
    return this.client.health();
  }
  /**
   * Get Meilisearch version info.
   *
   * @returns Version information
   */
  async version() {
    return this.client.getVersion();
  }
  /**
   * Wait for a task to complete.
   *
   * @param taskUid - Task UID from indexing operation
   * @param timeoutMs - Max wait time (default: 5000ms)
   * @returns Completed task
   */
  async waitForTask(t, a = 5e3) {
    return this.client.waitForTask(t, { timeOutMs: a });
  }
}
const p = {
  /**
   * Runa - Project management platform
   */
  runa: {
    projects: {
      name: "runa_projects",
      searchableAttributes: ["name", "description", "tags"],
      filterableAttributes: [
        "organization_id",
        "workspace_id",
        "status",
        "owner_id",
        "created_at",
        "updated_at"
      ],
      sortableAttributes: ["name", "created_at", "updated_at"]
    },
    tasks: {
      name: "runa_tasks",
      searchableAttributes: ["title", "description"],
      filterableAttributes: [
        "organization_id",
        "workspace_id",
        "project_id",
        "status",
        "assignee_id",
        "priority",
        "created_at",
        "updated_at",
        "due_date"
      ],
      sortableAttributes: [
        "title",
        "created_at",
        "updated_at",
        "due_date",
        "priority"
      ]
    },
    comments: {
      name: "runa_comments",
      searchableAttributes: ["content"],
      filterableAttributes: [
        "organization_id",
        "workspace_id",
        "task_id",
        "author_id",
        "created_at"
      ],
      sortableAttributes: ["created_at"]
    }
  },
  /**
   * Backfeed - User feedback platform
   */
  backfeed: {
    projects: {
      name: "backfeed_projects",
      searchableAttributes: ["name", "description"],
      filterableAttributes: [
        "organization_id",
        "workspace_id",
        "status",
        "created_at",
        "updated_at"
      ],
      sortableAttributes: ["name", "created_at", "updated_at"]
    },
    submissions: {
      name: "backfeed_submissions",
      searchableAttributes: ["title", "content", "tags"],
      filterableAttributes: [
        "organization_id",
        "workspace_id",
        "project_id",
        "status",
        "type",
        "author_id",
        "created_at",
        "updated_at",
        "votes"
      ],
      sortableAttributes: ["created_at", "updated_at", "votes"]
    }
  },
  /**
   * Blink - Link-in-bio platform
   */
  blink: {
    profiles: {
      name: "blink_profiles",
      searchableAttributes: ["username", "display_name", "bio"],
      filterableAttributes: [
        "organization_id",
        "user_id",
        "is_embeddable",
        "created_at",
        "updated_at"
      ],
      sortableAttributes: ["username", "display_name", "created_at", "updated_at"]
    },
    links: {
      name: "blink_links",
      searchableAttributes: ["title", "url"],
      filterableAttributes: [
        "organization_id",
        "profile_id",
        "type",
        "is_active",
        "created_at",
        "updated_at"
      ],
      sortableAttributes: ["title", "position", "created_at", "updated_at", "clicks"]
    }
  },
  /**
   * Arbor - Git hosting platform
   */
  arbor: {
    repositories: {
      name: "arbor_repositories",
      searchableAttributes: ["name", "description", "readme"],
      filterableAttributes: [
        "organization_id",
        "owner_id",
        "visibility",
        "language",
        "is_fork",
        "is_archived",
        "created_at",
        "updated_at",
        "stars"
      ],
      sortableAttributes: [
        "name",
        "created_at",
        "updated_at",
        "stars",
        "forks"
      ]
    },
    users: {
      name: "arbor_users",
      searchableAttributes: ["username", "display_name", "bio"],
      filterableAttributes: ["organization_id", "created_at"],
      sortableAttributes: ["username", "created_at"]
    },
    issues: {
      name: "arbor_issues",
      searchableAttributes: ["title", "body"],
      filterableAttributes: [
        "organization_id",
        "repo_id",
        "status",
        "author_id",
        "assignee_id",
        "labels",
        "created_at",
        "updated_at"
      ],
      sortableAttributes: ["created_at", "updated_at"]
    }
  }
};
function E(e) {
  return Object.values(p[e]);
}
function O() {
  return Object.values(p).flatMap(
    (e) => Object.values(e)
  );
}
function x(e) {
  if (!e.id)
    throw new Error("Document missing required id field");
  if (!e.organization_id)
    throw new Error(
      `Document ${e.id} missing required organization_id field`
    );
}
function j(e) {
  for (const t of e)
    x(t);
}
function I(e) {
  const t = (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    created_at: e.created_at ?? t,
    updated_at: t
  };
}
function S(e, t, a) {
  const r = [`organization_id = "${e}"`];
  if (t && r.push(`workspace_id = "${t}"`), a?.length)
    for (const i of a)
      r.push(`(${i})`);
  return r.join(" AND ");
}
function W(e) {
  const t = e.split("_");
  if (t.length < 2)
    throw new Error(
      `Invalid index name "${e}". Expected format: {product}_{entity}`
    );
  return {
    product: t[0],
    entity: t.slice(1).join("_")
  };
}
function K(e, t) {
  return `${e}_${t}`;
}
function U(e, t = 1e3) {
  const a = [];
  for (let r = 0; r < e.length; r += t)
    a.push(e.slice(r, r + t));
  return a;
}
export {
  T as OmniSearch,
  U as batchDocuments,
  K as buildIndexName,
  S as buildTenantFilter,
  O as getAllIndexes,
  E as getProductIndexes,
  p as indexes,
  W as parseIndexName,
  x as validateTenantDocument,
  j as validateTenantDocuments,
  I as withTimestamps
};
