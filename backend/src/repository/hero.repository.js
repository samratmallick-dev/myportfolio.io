import { Hero } from "../model/hero.model.js";
import { BaseRepository } from "./base.repository.js";

class HeroRepository extends BaseRepository {
      constructor() {
            super(Hero);
      }

      async updateOne(filter, updateData) {
            return await this.model.findOneAndUpdate(filter, updateData, { returnDocument: 'after', runValidators: true, upsert: true });
      }

      // Only the fields the public hero needs. Keeps the payload small and
      // avoids transmitting admin/bookkeeping fields to anonymous visitors.
      async findActivePublic() {
            return await this.model
                  .findOne({ isActive: true })
                  .select('name title description resumeLink profileImage')
                  .lean();
      }
}

export default new HeroRepository();
