import { TenantDocument } from './types.js';
/**
 * Validate that a document has required multi-tenancy fields.
 *
 * @param doc - Document to validate
 * @throws Error if organization_id is missing
 */
export declare function validateTenantDocument(doc: Partial<TenantDocument>): void;
/**
 * Validate multiple documents for tenant fields.
 *
 * @param docs - Documents to validate
 * @throws Error if any document is missing organization_id
 */
export declare function validateTenantDocuments(docs: Partial<TenantDocument>[]): void;
/**
 * Create a document with timestamp fields.
 *
 * @param doc - Base document data
 * @returns Document with created_at/updated_at timestamps
 */
export declare function withTimestamps<T extends TenantDocument>(doc: Omit<T, "created_at" | "updated_at"> & {
    created_at?: string;
    updated_at?: string;
}): T;
/**
 * Build a filter expression for tenant-scoped queries.
 *
 * @param organizationId - Organization to scope to
 * @param workspaceId - Optional workspace to scope to
 * @param additionalFilters - Additional filter expressions
 * @returns Combined filter expression
 *
 * @example
 * ```ts
 * buildTenantFilter("org_123")
 * // => 'organization_id = "org_123"'
 *
 * buildTenantFilter("org_123", "ws_456", ["status = active"])
 * // => 'organization_id = "org_123" AND workspace_id = "ws_456" AND (status = active)'
 * ```
 */
export declare function buildTenantFilter(organizationId: string, workspaceId?: string, additionalFilters?: string[]): string;
/**
 * Parse index name into product and entity.
 *
 * @param indexName - Index name (e.g., "runa_projects")
 * @returns Product and entity parts
 *
 * @example
 * ```ts
 * parseIndexName("runa_projects")
 * // => { product: "runa", entity: "projects" }
 * ```
 */
export declare function parseIndexName(indexName: string): {
    product: string;
    entity: string;
};
/**
 * Build an index name from product and entity.
 *
 * @param product - Product name (e.g., "runa")
 * @param entity - Entity name (e.g., "projects")
 * @returns Index name
 *
 * @example
 * ```ts
 * buildIndexName("runa", "projects")
 * // => "runa_projects"
 * ```
 */
export declare function buildIndexName(product: string, entity: string): string;
/**
 * Batch documents into chunks for bulk indexing.
 *
 * @param documents - Documents to batch
 * @param batchSize - Max documents per batch (default: 1000)
 * @returns Array of document batches
 */
export declare function batchDocuments<T>(documents: T[], batchSize?: number): T[][];
//# sourceMappingURL=utils.d.ts.map