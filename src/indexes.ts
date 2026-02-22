import type { IndexConfig } from "./types.js";

/**
 * Predefined index configurations for Omni products.
 *
 * These configs follow the {product}_{entity} naming convention
 * and include common filterable/sortable attributes.
 *
 * @example
 * ```ts
 * import { OmniSearch, indexes } from "@omnidotdev/search";
 *
 * const search = new OmniSearch({ host, masterKey });
 *
 * // Bootstrap Runa indexes
 * await search.configureIndex(indexes.runa.projects);
 * await search.configureIndex(indexes.runa.tasks);
 * await search.configureIndex(indexes.runa.comments);
 * ```
 */
export const indexes = {
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
        "updated_at",
      ],
      sortableAttributes: ["name", "created_at", "updated_at"],
    } satisfies IndexConfig,

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
        "due_date",
      ],
      sortableAttributes: [
        "title",
        "created_at",
        "updated_at",
        "due_date",
        "priority",
      ],
    } satisfies IndexConfig,

    comments: {
      name: "runa_comments",
      searchableAttributes: ["content"],
      filterableAttributes: [
        "organization_id",
        "workspace_id",
        "task_id",
        "author_id",
        "created_at",
      ],
      sortableAttributes: ["created_at"],
    } satisfies IndexConfig,
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
        "updated_at",
      ],
      sortableAttributes: ["name", "created_at", "updated_at"],
    } satisfies IndexConfig,

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
        "votes",
      ],
      sortableAttributes: ["created_at", "updated_at", "votes"],
    } satisfies IndexConfig,
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
        "updated_at",
      ],
      sortableAttributes: ["username", "display_name", "created_at", "updated_at"],
    } satisfies IndexConfig,

    links: {
      name: "blink_links",
      searchableAttributes: ["title", "url"],
      filterableAttributes: [
        "organization_id",
        "profile_id",
        "type",
        "is_active",
        "created_at",
        "updated_at",
      ],
      sortableAttributes: ["title", "position", "created_at", "updated_at", "clicks"],
    } satisfies IndexConfig,
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
        "stars",
      ],
      sortableAttributes: [
        "name",
        "created_at",
        "updated_at",
        "stars",
        "forks",
      ],
    } satisfies IndexConfig,

    users: {
      name: "arbor_users",
      searchableAttributes: ["username", "display_name", "bio"],
      filterableAttributes: ["organization_id", "created_at"],
      sortableAttributes: ["username", "created_at"],
    } satisfies IndexConfig,

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
        "updated_at",
      ],
      sortableAttributes: ["created_at", "updated_at"],
    } satisfies IndexConfig,
  },
} as const;

/**
 * Helper to get all index configs for a product.
 *
 * @param product - Product name
 * @returns Array of index configs
 *
 * @example
 * ```ts
 * const runaIndexes = getProductIndexes("runa");
 * for (const config of runaIndexes) {
 *   await search.configureIndex(config);
 * }
 * ```
 */
export function getProductIndexes(
  product: keyof typeof indexes,
): IndexConfig[] {
  return Object.values(indexes[product]) as IndexConfig[];
}

/**
 * Get all defined index configurations.
 *
 * @returns Array of all index configs
 */
export function getAllIndexes(): IndexConfig[] {
  return Object.values(indexes).flatMap(
    (product) => Object.values(product) as IndexConfig[],
  );
}
