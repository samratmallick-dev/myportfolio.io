import { Hero } from "../model/hero.model.js";
import { BaseRepository } from "./base.repository.js";

class HeroRepository extends BaseRepository {
      constructor() {
            super(Hero);
      }

      async updateOne(filter, updateData) {
            return await this.model.findOneAndUpdate(filter, updateData, { new: true, runValidators: true, upsert: true });
      }
}

export default new HeroRepository();
