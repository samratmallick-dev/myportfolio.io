import { About } from "../model/about.model.js";
import { BaseRepository } from "./base.repository.js";

class AboutRepository extends BaseRepository {
      constructor() {
            super(About);
      }

      async updateOne(filter, updateData) {
            return await this.model.findOneAndUpdate(filter, updateData, { returnDocument: 'after', runValidators: true, upsert: true });
      }

      async findActivePublic() {
            return await this.model
                  .findOne({ isActive: true })
                  .select('paragraphs aboutImage')
                  .lean();
      }
}

export default new AboutRepository();
