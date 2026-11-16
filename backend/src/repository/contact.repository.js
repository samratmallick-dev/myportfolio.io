import { ContactDetails, Message } from "../model/contact.model.js";
import { BaseRepository } from "./base.repository.js";

class ContactRepository extends BaseRepository {
      constructor() {
            super(ContactDetails);
            this.MessageModel = Message;
      }

      async createContactDetails(contactData) {
            return await this.model.create(contactData);
      }

      async findContactDetails(filter = {}) {
            return await this.model.findOne(filter).lean();
      }

      async findActiveContactDetails() {
            return await this.model.findOne({ isActive: true }).lean();
      }

      async findActiveContactDetailsPublic() {
            return await this.model
                  .findOne({ isActive: true })
                  .select('name email mobile address contactImage socialLinks')
                  .lean();
      }

      async updateContactDetails(id, updateData) {
            return await this.model.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
      }

      async updateOneContactDetails(filter, updateData) {
            return await this.model.findOneAndUpdate(filter, updateData, { returnDocument: 'after', runValidators: true, upsert: true });
      }

      async createMessage(messageData) {
            return await this.MessageModel.create(messageData);
      }

      async findMessageById(id) {
            return await this.MessageModel.findById(id).lean();
      }

      async findAllMessages(filter = {}) {
            return await this.MessageModel.find(filter).sort({ createdAt: -1 }).lean();
      }

      async findActiveMessages(filter = {}) {
            return await this.MessageModel.find({ ...filter, isActive: true }).sort({ createdAt: -1 }).lean();
      }

      async updateMessageById(id, updateData) {
            return await this.MessageModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
      }

      async deleteMessageById(id) {
            return await this.MessageModel.findByIdAndDelete(id);
      }

      async countMessages(filter = {}) {
            return await this.MessageModel.countDocuments(filter);
      }

      async countUnreadMessages() {
            return await this.MessageModel.countDocuments({ status: "unread", isActive: true });
      }

      async markMessageAsRead(id) {
            return await this.MessageModel.findByIdAndUpdate(id, { status: "read" }, { returnDocument: 'after' });
      }
}

export default new ContactRepository();