/**
 * Base document type with required multi-tenancy fields.
 * All indexed documents MUST include organization_id.
 */
export interface TenantDocument {
  /** Unique document identifier */
  id: string;
  /** Required for multi-tenancy - enforced via scoped API keys */
  organization_id: string;
  /** Optional workspace hierarchy within organization */
  workspace_id?: string;
  /** Timestamp for time-based queries */
  created_at?: string;
  /** Timestamp for time-based queries */
  updated_at?: string;
}

/**
 * Configuration for creating an OmniSearch client.
 */
export interface OmniSearchConfig {
  /** Meilisearch host URL (e.g., https://search.omni.dev) */
  host: string;
  /** Master API key - NEVER expose to clients */
  masterKey: string;
  /** Optional request timeout in milliseconds */
  timeout?: number;
}

/**
 * Configuration for generating a tenant-scoped search key.
 */
export interface TenantKeyConfig {
  /** Organization ID to scope the key to */
  organizationId: string;
  /** Optional workspace ID for additional scoping */
  workspaceId?: string;
  /** Key expiration time (default: 1 hour from now) */
  expiresAt?: Date;
  /** Optional: restrict to specific indexes */
  indexes?: string[];
}

/**
 * Index configuration for a product entity.
 */
export interface IndexConfig {
  /** Index name following {product}_{entity} convention */
  name: string;
  /** Primary key field (default: "id") */
  primaryKey?: string;
  /** Fields to make searchable */
  searchableAttributes?: string[];
  /** Fields available for filtering */
  filterableAttributes?: string[];
  /** Fields available for sorting */
  sortableAttributes?: string[];
  /** Fields to display in search results */
  displayedAttributes?: string[];
  /** Ranking rules customization */
  rankingRules?: string[];
  /** Stop words to ignore */
  stopWords?: string[];
  /** Synonyms for search expansion */
  synonyms?: Record<string, string[]>;
  /** Distinct attribute for deduplication */
  distinctAttribute?: string;
  /** Typo tolerance settings */
  typoTolerance?: {
    enabled?: boolean;
    minWordSizeForTypos?: {
      oneTypo?: number;
      twoTypos?: number;
    };
    disableOnWords?: string[];
    disableOnAttributes?: string[];
  };
}

/**
 * Predefined index configurations for Omni products.
 * Used with OmniSearch.configureIndex().
 */
export interface ProductIndexConfigs {
  runa: {
    projects: IndexConfig;
    tasks: IndexConfig;
    comments: IndexConfig;
  };
  backfeed: {
    projects: IndexConfig;
    submissions: IndexConfig;
  };
  arbor: {
    repositories: IndexConfig;
    users: IndexConfig;
    issues: IndexConfig;
  };
}

/**
 * Search options with tenant enforcement.
 */
export interface TenantSearchOptions {
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Filter expression (organization_id is auto-added) */
  filter?: string | string[];
  /** Facets to retrieve */
  facets?: string[];
  /** Attributes to highlight */
  attributesToHighlight?: string[];
  /** Attributes to crop */
  attributesToCrop?: string[];
  /** Crop length */
  cropLength?: number;
  /** Show matches position */
  showMatchesPosition?: boolean;
  /** Sort order */
  sort?: string[];
}
