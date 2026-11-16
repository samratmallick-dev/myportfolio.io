import { Project } from "../model/project.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildPaginationMeta, parsePagination } from "../utilities/pagination.util.js";

// Fields required by project cards/listings. Heavy case-study fields
// (description, features, architecture, process, challenges, results,
// gallery) are only returned by the detail endpoint.
const PUBLIC_CARD_FIELDS = [
      'slug',
      'title',
      'shortDescription',
      'image',
      'technologies',
      'category',
      'year',
      'githubUrl',
      'liveUrl',
      'status',
      'isFeatured',
      'order',
      'createdAt',
].join(' ');

class ProjectRepository extends BaseRepository {
      constructor() {
            super(Project);
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).sort({ createdAt: 1 }).lean();
      }

      async findActive(filter = {}) {
            return await this.model.find({ ...filter, isActive: true }).sort({ createdAt: 1 }).lean();
      }

      async findFeatured() {
            return await this.model
                  .find({ isActive: true, isFeatured: true })
                  .select('-__v')
                  .sort({ createdAt: 1 })
                  .limit(6)
                  .lean();
      }

      async findFeaturedPublic() {
            return await this.model
                  .find({ isActive: true, isFeatured: true })
                  .select(PUBLIC_CARD_FIELDS)
                  .sort({ order: 1, createdAt: 1 })
                  .limit(6)
                  .lean();
      }

      async findPublicPage(query = {}, filter = {}) {
            const { page, limit, skip } = parsePagination(query);
            const searchFilter = { ...filter, isActive: true };

            const [items, total] = await Promise.all([
                  this.model
                        .find(searchFilter)
                        .select(PUBLIC_CARD_FIELDS)
                        .sort({ order: 1, createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .lean(),
                  this.model.countDocuments(searchFilter),
            ]);

            return {
                  items,
                  pagination: buildPaginationMeta({ page, limit, total }),
            };
      }

      async findBySlug(slug) {
            return await this.model.findOne({ slug, isActive: true }).lean();
      }

      async findAnyBySlug(slug) {
            return await this.model.findOne({ slug }).lean();
      }
};

export default new ProjectRepository();
export { PUBLIC_CARD_FIELDS };
