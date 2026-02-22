import type { TenantDocument } from "./types.js";

/**
 * Validate that a document has required multi-tenancy fields.
 *
 * @param doc - Document to validate
 * @throws Error if organization_id is missing
 */
export function validateTenantDocument(doc: Partial<TenantDocument>): void {
  if (!doc.id) {
    throw new Error("Document missing required id field");
  }
  if (!doc.organization_id) {
    throw new Error(
      `Document ${doc.id} missing required organization_id field`,
    );
  }
}

/**
 * Validate multiple documents for tenant fields.
 *
 * @param docs - Documents to validate
 * @throws Error if any document is missing organization_id
 */
export function validateTenantDocuments(docs: Partial<TenantDocument>[]): void {
  for (const doc of docs) {
    validateTenantDocument(doc);
  }
}

/**
 * Create a document with timestamp fields.
 *
 * @param doc - Base document data
 * @returns Document with created_at/updated_at timestamps
 */
export function withTimestamps<T extends TenantDocument>(
  doc: Omit<T, "created_at" | "updated_at"> & {
    created_at?: string;
    updated_at?: string;
  },
): T {
  const now = new Date().toISOString();
  return {
    ...doc,
    created_at: doc.created_at ?? now,
    updated_at: now,
  } as T;
}

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
export function buildTenantFilter(
  organizationId: string,
  workspaceId?: string,
  additionalFilters?: string[],
): string {
  const filters: string[] = [`organization_id = "${organizationId}"`];

  if (workspaceId) {
    filters.push(`workspace_id = "${workspaceId}"`);
  }

  if (additionalFilters?.length) {
    for (const filter of additionalFilters) {
      filters.push(`(${filter})`);
    }
  }

  return filters.join(" AND ");
}

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
export function parseIndexName(indexName: string): {
  product: string;
  entity: string;
} {
  const parts = indexName.split("_");
  if (parts.length < 2) {
    throw new Error(
      `Invalid index name "${indexName}". Expected format: {product}_{entity}`,
    );
  }
  return {
    product: parts[0],
    entity: parts.slice(1).join("_"),
  };
}

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
export function buildIndexName(product: string, entity: string): string {
  return `${product}_${entity}`;
}

/**
 * Batch documents into chunks for bulk indexing.
 *
 * @param documents - Documents to batch
 * @param batchSize - Max documents per batch (default: 1000)
 * @returns Array of document batches
 */
export function batchDocuments<T>(documents: T[], batchSize = 1000): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < documents.length; i += batchSize) {
    batches.push(documents.slice(i, i + batchSize));
  }
  return batches;
}
