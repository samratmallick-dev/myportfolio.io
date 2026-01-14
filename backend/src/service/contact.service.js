import contactRepository from "../repository/contact.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";
import { sendEmail } from "../utilities/email/sendEmail.js";

class ContactService {
      async addUpdateContactDetails(contactData, image) {
            let contactDetails = await contactRepository.findActiveContactDetails();

            if (contactData.socialLinks && typeof contactData.socialLinks === "string") {
                  contactData.socialLinks = JSON.parse(contactData.socialLinks);
            }

            if (image) {
                  const uploaded = await uploadToCloudinary(image, "contact/images");
                  contactData.contactImage = {
                        public_id: uploaded.public_id,
                        url: uploaded.secure_url,
                  };
            }

            if (contactDetails) {
                  return await contactRepository.updateContactDetails(contactDetails._id, contactData);
            }

            return await contactRepository.createContactDetails(contactData);
      }

      async getContactDetails() {
            const contact = await contactRepository.findActiveContactDetails();
            if (!contact) throw ApiError.notFound("Contact details not found");
            return contact;
      }

      async sendMessage(messageData) {
      const message = await contactRepository.createMessage(messageData);

      const count = await contactRepository.countMessages();
      if (count > 20) {
            const messages = await contactRepository.findAllMessages();
            const excess = messages.slice(20);
            for (const msg of excess) {
                  await contactRepository.deleteMessageById(msg._id);
            }
      }

      sendEmail({
            to: messageData.email,
            subject: "Message Received",
            text: `Hi ${messageData.name},

            We received your message and will contact you soon.

            Your message:
            ${messageData.message}`
      }).catch(err => {
            console.error("User email failed:", err.message);
      });

      const contact = await contactRepository.findActiveContactDetails();
      if (contact?.email) {
            sendEmail({
                  to: contact.email,
                  subject: `New Contact Message - ${messageData.name}`,
                  text: `Name: ${messageData.name}
                        Email: ${messageData.email}
                        Mobile: ${messageData.mobile}
                        Message: ${messageData.message}`
            }).catch(err => {
                  console.error("Admin email failed:", err.message);
            });
      }

      return message;
}

      async getAllMessages() {
            return await contactRepository.findActiveMessages();
      }

      async deleteMessage(id) {
            const msg = await contactRepository.findMessageById(id);
            if (!msg) throw ApiError.notFound("Message not found");
            await contactRepository.deleteMessageById(id);
            return true;
      }

      async markMessageAsRead(id) {
            const msg = await contactRepository.markMessageAsRead(id);
            if (!msg) throw ApiError.notFound("Message not found");
            return msg;
      }

      async getUnreadMessagesCount() {
            const count = await contactRepository.countUnreadMessages();
            return { count };
      }

      async getAllMessagesAdmin() {
            return await contactRepository.findAllMessages();
      }

      }

export default new ContactService();
