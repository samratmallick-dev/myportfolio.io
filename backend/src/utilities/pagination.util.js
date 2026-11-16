const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 24;

/**
 * Normalise pagination query params so controllers never trust user input.
 * Returns safe positive integers and a ready-to-use `skip` value.
 */
export const parsePagination = (query = {}, options = {}) => {
      const defaultLimit = options.defaultLimit || DEFAULT_LIMIT;
      const maxLimit = options.maxLimit || MAX_LIMIT;

      const rawPage = Number.parseInt(query.page, 10);
      const rawLimit = Number.parseInt(query.limit, 10);

      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
      const limit = Number.isFinite(rawLimit) && rawLimit > 0
            ? Math.min(rawLimit, maxLimit)
            : defaultLimit;

      return {
            page,
            limit,
            skip: (page - 1) * limit,
      };
};

export const buildPaginationMeta = ({ page, limit, total }) => {
      const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

      return {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
      };
};

export { DEFAULT_LIMIT, MAX_LIMIT };
