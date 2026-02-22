import { IndexConfig } from './types.js';
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
export declare const indexes: {
    /**
     * Runa - Project management platform
     */
    readonly runa: {
        readonly projects: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
        readonly tasks: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
        readonly comments: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
    };
    /**
     * Backfeed - User feedback platform
     */
    readonly backfeed: {
        readonly projects: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
        readonly submissions: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
    };
    /**
     * Blink - Link-in-bio platform
     */
    readonly blink: {
        readonly profiles: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
        readonly links: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
    };
    /**
     * Arbor - Git hosting platform
     */
    readonly arbor: {
        readonly repositories: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
        readonly users: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
        readonly issues: {
            name: string;
            searchableAttributes: string[];
            filterableAttributes: string[];
            sortableAttributes: string[];
        };
    };
};
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
export declare function getProductIndexes(product: keyof typeof indexes): IndexConfig[];
/**
 * Get all defined index configurations.
 *
 * @returns Array of all index configs
 */
export declare function getAllIndexes(): IndexConfig[];
//# sourceMappingURL=indexes.d.ts.map