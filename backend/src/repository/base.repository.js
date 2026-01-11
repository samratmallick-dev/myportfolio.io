class BaseRepository {
      constructor(model) {
            this.model = model;
      }

      async create(data) {
            return await this.model.create(data);
      }

      async findById(id) {
            return await this.model.findById(id);
      }

      async findOne(filter = {}) {
            return await this.model.findOne(filter);
      }

      async find(filter = {}) {
            return await this.model.find(filter);
      }

      async findActive() {
            return await this.model.findOne({ isActive: true });
      }

      async findAll(filter = {}) {
            return await this.model.find(filter);
      }

      async updateById(id, updateData) {
            return await this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      }

      async updateOne(filter, updateData) {
            return await this.model.findOneAndUpdate(filter, updateData, { new: true, runValidators: true, upsert: true });
      }

      async deleteById(id) {
            return await this.model.findByIdAndDelete(id);
      }

      async softDeleteById(id) {
            return await this.model.findByIdAndUpdate(id, { isActive: false }, { new: true });
      }

      async count(filter = {}) {
            return await this.model.countDocuments(filter);
      }

      async exists(filter) {
            return await this.model.exists(filter);
      }

      async findWithPagination(filter = {}, options = {}) {
            const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                  this.model.find(filter).sort(sort).skip(skip).limit(limit),
                  this.count(filter)
            ]);

            return {
                  data,
                  pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                  }
            };
      }
}

export { BaseRepository };
