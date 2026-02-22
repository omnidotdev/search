import { MeiliSearch } from 'meilisearch';
import { IndexConfig, OmniSearchConfig, TenantDocument, TenantKeyConfig, TenantSearchOptions } from './types.js';
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
export declare class OmniSearch {
    private client;
    constructor(config: OmniSearchConfig);
    /**
     * Get the underlying MeiliSearch client for advanced operations.
     * Use with caution - prefer the wrapped methods for tenant safety.
     */
    get raw(): MeiliSearch;
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
    generateTenantKey(config: TenantKeyConfig): Promise<string>;
    /**
     * Get an index reference for document operations.
     *
     * @param indexName - Index name (e.g., "runa_projects")
     * @returns Index reference
     */
    index(indexName: string): import('meilisearch').Index<Record<string, any>>;
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
    configureIndex(config: IndexConfig): Promise<void>;
    /**
     * Add or update documents in an index.
     * Validates that all documents have organization_id.
     *
     * @param indexName - Target index
     * @param documents - Documents to index (must include organization_id)
     * @returns Indexing task
     */
    addDocuments<T extends TenantDocument>(indexName: string, documents: T[]): Promise<import('meilisearch').EnqueuedTask>;
    /**
     * Delete documents from an index.
     *
     * @param indexName - Target index
     * @param documentIds - IDs to delete
     * @returns Deletion task
     */
    deleteDocuments(indexName: string, documentIds: string[]): Promise<import('meilisearch').EnqueuedTask>;
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
    searchTenant<T extends TenantDocument>(indexName: string, query: string, organizationId: string, options?: TenantSearchOptions): Promise<import('meilisearch').SearchResponse<T, import('meilisearch').SearchParams>>;
    /**
     * Get index statistics.
     *
     * @param indexName - Index name
     * @returns Index stats
     */
    getIndexStats(indexName: string): Promise<import('meilisearch').IndexStats>;
    /**
     * Check if Meilisearch is healthy.
     *
     * @returns Health status
     */
    health(): Promise<import('meilisearch').Health>;
    /**
     * Get Meilisearch version info.
     *
     * @returns Version information
     */
    version(): Promise<import('meilisearch').Version>;
    /**
     * Wait for a task to complete.
     *
     * @param taskUid - Task UID from indexing operation
     * @param timeoutMs - Max wait time (default: 5000ms)
     * @returns Completed task
     */
    waitForTask(taskUid: number, timeoutMs?: number): Promise<import('meilisearch').Task>;
}
//# sourceMappingURL=client.d.ts.map