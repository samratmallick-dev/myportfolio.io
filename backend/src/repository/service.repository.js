import { Service } from "../model/service.model.js";
import { BaseRepository } from "./base.repository.js";

class ServiceRepository extends BaseRepository {
      constructor() {
            super(Service);
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).sort({ createdAt: 1 });
      }

      async findActive(filter = {}) {
            return await this.model.find({ ...filter, isActive: true }).sort({ createdAt: 1 });
      }
}

export default new ServiceRepository();
