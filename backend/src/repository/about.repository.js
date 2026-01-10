import { About } from "../model/about.model.js";
import { BaseRepository } from "./base.repository.js";

class AboutRepository extends BaseRepository {
  constructor() {
    super(About);
  }

  async updateOne(filter, updateData) {
    return await this.model.findOneAndUpdate(filter, updateData, { new: true, runValidators: true, upsert: true });
  }
}

export default new AboutRepository();
