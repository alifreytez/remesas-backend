/**
 * Metadata de paginación estandarizada
 */
export interface PaginationMetadata {
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
}

/**
 * Parámetros de paginación desde query string
 */
export interface QueryPaginationParams {
    page?: number;
    limit?: number;
}

/**
 * Parámetros de ordenamiento desde query string
 */
export interface QueryOrderParams {
    [key: `order.${string}`]: 'asc' | 'desc';
}

/**
 * Parámetros de condiciones desde query string
 */
export interface QueryConditionParams {
    [key: `qc.${string}`]: any;
}

/**
 * Tipo completo para query parameters de la API
 */
export type ApiQueryParams = QueryPaginationParams & Partial<QueryOrderParams> & Partial<QueryConditionParams> & Record<string, any>;

/**
 * Representación interna de filtros procesados
 */
export interface ProcessedQueryFilters {
    pagination: {
        offset: number;
        limit?: number;
    };
    order: Array<[string, 'asc' | 'desc']>;
    qc: Record<string, any>;
    raw?: Record<string, any>;
}
