/**
 * @omnidotdev/search
 *
 * Meilisearch wrapper with multi-tenant support for Omni products.
 *
 * @example
 * ```ts
 * import { OmniSearch, indexes } from "@omnidotdev/search";
 *
 * // Initialize server-side client
 * const search = new OmniSearch({
 *   host: process.env.MEILISEARCH_URL,
 *   masterKey: process.env.MEILISEARCH_MASTER_KEY,
 * });
 *
 * // Bootstrap indexes (run once during deployment)
 * await search.configureIndex(indexes.runa.projects);
 * await search.configureIndex(indexes.runa.tasks);
 *
 * // Generate tenant-scoped key for frontend
 * const tenantKey = await search.generateTenantKey({
 *   organizationId: session.organizationId,
 *   expiresAt: new Date(Date.now() + 3600_000),
 * });
 *
 * // Index documents (server-side)
 * await search.addDocuments("runa_projects", [
 *   { id: "proj_1", organization_id: orgId, name: "My Project" },
 * ]);
 *
 * // Search with tenant enforcement (server-side)
 * const results = await search.searchTenant(
 *   "runa_projects",
 *   "my query",
 *   session.organizationId
 * );
 * ```
 *
 * @packageDocumentation
 */
export { OmniSearch } from './client.js';
export { getAllIndexes, getProductIndexes, indexes } from './indexes.js';
export { batchDocuments, buildIndexName, buildTenantFilter, parseIndexName, validateTenantDocument, validateTenantDocuments, withTimestamps, } from './utils.js';
export type { IndexConfig, OmniSearchConfig, ProductIndexConfigs, TenantDocument, TenantKeyConfig, TenantSearchOptions, } from './types.js';
//# sourceMappingURL=index.d.ts.map