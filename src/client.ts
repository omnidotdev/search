import { MeiliSearch } from "meilisearch";
import { generateTenantToken } from "meilisearch/token";

import type { TokenSearchRules } from "meilisearch";
import type {
  IndexConfig,
  OmniSearchConfig,
  TenantDocument,
  TenantKeyConfig,
  TenantSearchOptions,
} from "./types.js";

/**
 * OmniSearch client - Meilisearch wrapper with multi-tenant support.
 *
 * Designed for use in Omni product APIs (runa-api, backfeed-api, etc.).
 * Server-side only - never expose the master key to clients.
 *
 * @example
 * ```ts
 * const search = new OmniSearch({
 *   host: process.env.MEILISEARCH_URL,
 *   masterKey: process.env.MEILISEARCH_MASTER_KEY,
 * });
 *
 * // Generate a tenant-scoped key for the frontend
 * const tenantKey = await search.generateTenantKey({
 *   organizationId: session.organizationId,
 *   expiresAt: new Date(Date.now() + 3600_000),
 * });
 *
 * // Index documents (server-side)
 * await search.index("runa_projects").addDocuments([
 *   { id: "proj_1", organization_id: orgId, name: "My Project" }
 * ]);
 * ```
 */
export class OmniSearch {
  private client: MeiliSearch;

  constructor(config: OmniSearchConfig) {
    this.client = new MeiliSearch({
      host: config.host,
      apiKey: config.masterKey,
      timeout: config.timeout,
    });
  }

  /**
   * Get the underlying MeiliSearch client for advanced operations.
   * Use with caution - prefer the wrapped methods for tenant safety.
   */
  get raw(): MeiliSearch {
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
  async generateTenantKey(config: TenantKeyConfig): Promise<string> {
    const { organizationId, workspaceId, expiresAt, indexes } = config;

    // Build filter expression
    const filters: string[] = [`organization_id = "${organizationId}"`];
    if (workspaceId) {
      filters.push(`workspace_id = "${workspaceId}"`);
    }
    const filterExpression = filters.join(" AND ");

    // Build search rules
    const searchRules: TokenSearchRules = indexes
      ? Object.fromEntries(
          indexes.map((idx) => [idx, { filter: filterExpression }]),
        )
      : { "*": { filter: filterExpression } };

    // Get API key UID (required for token generation)
    const keys = await this.client.getKeys();
    const defaultSearchKey = keys.results.find(
      (k) => k.actions.includes("search") && k.actions.length === 1,
    );

    if (!defaultSearchKey) {
      throw new Error(
        "No search-only API key found. Create one in Meilisearch with search action.",
      );
    }

    return generateTenantToken({
      apiKey: defaultSearchKey.key,
      apiKeyUid: defaultSearchKey.uid,
      searchRules,
      expiresAt: expiresAt ?? new Date(Date.now() + 3600_000),
    });
  }

  /**
   * Get an index reference for document operations.
   *
   * @param indexName - Index name (e.g., "runa_projects")
   * @returns Index reference
   */
  index(indexName: string) {
    return this.client.index(indexName);
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
  async configureIndex(config: IndexConfig): Promise<void> {
    const { name, primaryKey = "id", ...settings } = config;

    // Create index if it doesn't exist
    await this.client.createIndex(name, { primaryKey });

    const index = this.client.index(name);

    // Apply settings
    if (settings.searchableAttributes) {
      await index.updateSearchableAttributes(settings.searchableAttributes);
    }
    if (settings.filterableAttributes) {
      // Always include organization_id for multi-tenancy
      const filterableWithOrg = settings.filterableAttributes.includes(
        "organization_id",
      )
        ? settings.filterableAttributes
        : ["organization_id", ...settings.filterableAttributes];
      await index.updateFilterableAttributes(filterableWithOrg);
    } else {
      // Default: at minimum, organization_id must be filterable
      await index.updateFilterableAttributes(["organization_id"]);
    }
    if (settings.sortableAttributes) {
      await index.updateSortableAttributes(settings.sortableAttributes);
    }
    if (settings.displayedAttributes) {
      await index.updateDisplayedAttributes(settings.displayedAttributes);
    }
    if (settings.rankingRules) {
      await index.updateRankingRules(settings.rankingRules);
    }
    if (settings.stopWords) {
      await index.updateStopWords(settings.stopWords);
    }
    if (settings.synonyms) {
      await index.updateSynonyms(settings.synonyms);
    }
    if (settings.distinctAttribute) {
      await index.updateDistinctAttribute(settings.distinctAttribute);
    }
    if (settings.typoTolerance) {
      await index.updateTypoTolerance(settings.typoTolerance);
    }
  }

  /**
   * Add or update documents in an index.
   * Validates that all documents have organization_id.
   *
   * @param indexName - Target index
   * @param documents - Documents to index (must include organization_id)
   * @returns Indexing task
   */
  async addDocuments<T extends TenantDocument>(
    indexName: string,
    documents: T[],
  ) {
    // Validate tenant field presence
    for (const doc of documents) {
      if (!doc.organization_id) {
        throw new Error(
          `Document ${doc.id} missing required organization_id field`,
        );
      }
    }

    return this.client.index(indexName).addDocuments(documents);
  }

  /**
   * Delete documents from an index.
   *
   * @param indexName - Target index
   * @param documentIds - IDs to delete
   * @returns Deletion task
   */
  async deleteDocuments(indexName: string, documentIds: string[]) {
    return this.client.index(indexName).deleteDocuments(documentIds);
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
  async searchTenant<T extends TenantDocument>(
    indexName: string,
    query: string,
    organizationId: string,
    options: TenantSearchOptions = {},
  ) {
    const { filter, ...restOptions } = options;

    // Build filter with organization enforcement
    const orgFilter = `organization_id = "${organizationId}"`;
    let combinedFilter: string | string[];

    if (!filter) {
      combinedFilter = orgFilter;
    } else if (typeof filter === "string") {
      combinedFilter = `(${filter}) AND ${orgFilter}`;
    } else {
      combinedFilter = [...filter, orgFilter];
    }

    return this.client.index(indexName).search<T>(query, {
      ...restOptions,
      filter: combinedFilter,
    });
  }

  /**
   * Get index statistics.
   *
   * @param indexName - Index name
   * @returns Index stats
   */
  async getIndexStats(indexName: string) {
    return this.client.index(indexName).getStats();
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
  async waitForTask(taskUid: number, timeoutMs = 5000) {
    return this.client.waitForTask(taskUid, { timeOutMs: timeoutMs });
  }
}
