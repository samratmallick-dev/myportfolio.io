import { ContactDetails, Message } from "../model/contact.model.js";
import { BaseRepository } from "./base.repository.js";

class ContactRepository extends BaseRepository {
      constructor() {
            super(ContactDetails);
            this.MessageModel = Message;
      }

      // Contact Details Methods
      async createContactDetails(contactData) {
            return await this.model.create(contactData);
      }

      async findContactDetails(filter = {}) {
            return await this.model.findOne(filter);
      }

      async findActiveContactDetails() {
            return await this.model.findOne({ isActive: true });
      }

      async updateContactDetails(id, updateData) {
            return await this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      }

      async updateOneContactDetails(filter, updateData) {
            return await this.model.findOneAndUpdate(filter, updateData, { new: true, runValidators: true, upsert: true });
      }

      // Message Methods
      async createMessage(messageData) {
            return await this.MessageModel.create(messageData);
      }

      async findMessageById(id) {
            return await this.MessageModel.findById(id);
      }

      async findAllMessages(filter = {}) {
            return await this.MessageModel.find(filter).sort({ createdAt: -1 });
      }

      async findActiveMessages(filter = {}) {
            return await this.MessageModel.find({ ...filter, isActive: true }).sort({ createdAt: -1 });
      }

      async updateMessageById(id, updateData) {
            return await this.MessageModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
            return await this.MessageModel.findByIdAndUpdate(id, { status: "read" }, { new: true });
      }

      async replyToMessage(id, replyData) {
            return await this.MessageModel.findByIdAndUpdate(
                  id,
                  {
                        replyMessage: replyData.replyMessage,
                        repliedAt: new Date(),
                        repliedBy: replyData.adminId,
                        status: "replied",
                        isReplied: true
                  },
                  { new: true, runValidators: true }
            );
      }
}

export default new ContactRepository();