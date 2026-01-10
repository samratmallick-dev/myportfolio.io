import contactRepository from "../repository/contact.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";
import { sendEmail } from "../utilities/email/sendEmail.js";

class ContactService {
  // Contact Details Methods
  async addUpdateContactDetails(contactData, images) {
    let contactDetails = await contactRepository.findActive();

    if (images && images.length > 0) {
      const uploadPromises = images.map(image =>
        uploadToCloudinary(image, "contact/images")
      );

      const cloudinaryResponses = await Promise.all(uploadPromises);

      if (cloudinaryResponses.length > 0) {
        contactDetails.profileImage = {
          public_id: cloudinaryResponses[0].public_id,
          url: cloudinaryResponses[0].secure_url,
        };
      }
    }

    if (contactDetails) {
      contactDetails = await contactRepository.updateById(contactDetails._id, contactData);
    } else {
      contactDetails = await contactRepository.create(contactData);
    }

    return contactDetails;
  }

  async getContactDetails() {
    const contactDetails = await contactRepository.findActive();

    if (!contactDetails) {
      throw ApiError.notFound("Contact details not found");
    }

    return contactDetails;
  }

  async updateContactDetails(id, contactData, images) {
    const existingContact = await contactRepository.findById(id);

    if (!existingContact) {
      throw ApiError.notFound("Contact details not found");
    }

    if (images && images.length > 0) {
      const uploadPromises = images.map(image =>
        uploadToCloudinary(image, "contact/images")
      );

      const cloudinaryResponses = await Promise.all(uploadPromises);

      if (cloudinaryResponses.length > 0) {
        contactData.profileImage = {
          public_id: cloudinaryResponses[0].public_id,
          url: cloudinaryResponses[0].secure_url,
        };
      }
    }

    const updatedContact = await contactRepository.updateById(id, contactData);
    return updatedContact;
  }

  // Message Methods
  async sendMessage(messageData) {
    const message = await contactRepository.createMessage(messageData);

    try {
      await sendEmail({
        to: messageData.email,
        subject: "Message Received - Thank You",
        text: `Thank you for contacting us. We have received your message and will get back to you soon.\n\nMessage details:\nSubject: ${messageData.subject}\nMessage: ${messageData.message}`,
      });

      const contactDetails = await contactRepository.findActive();
      if (contactDetails && contactDetails.email) {
        await sendEmail({
          to: contactDetails.email,
          subject: `New Contact Message: ${messageData.subject}`,
          text: `You have received a new message from ${messageData.name} (${messageData.email}):\n\nSubject: ${messageData.subject}\nMessage: ${messageData.message}`,
        });
      }
    } catch (error) {
      console.error("Error sending notification emails:", error);
    }

    return message;
  }

  async getAllMessages() {
    const messages = await contactRepository.findActiveMessages();
    return messages;
  }

  async getMessageById(messageId) {
    const message = await contactRepository.findMessageById(messageId);

    if (!message) {
      throw ApiError.notFound("Message not found");
    }

    if (!message.isActive) {
      throw ApiError.badRequest("Message is not active");
    }

    return message;
  }

  async deleteMessage(messageId) {
    const message = await contactRepository.findMessageById(messageId);

    if (!message) {
      throw ApiError.notFound("Message not found");
    }

    await contactRepository.deleteMessageById(messageId);
    return { message: "Message deleted successfully" };
  }

  async markMessageAsRead(messageId) {
    const message = await contactRepository.markMessageAsRead(messageId);

    if (!message) {
      throw ApiError.notFound("Message not found");
    }

    return message;
  }

  async replyToMessage(messageId, replyData) {
    const message = await contactRepository.replyToMessage(messageId, replyData);

    if (!message) {
      throw ApiError.notFound("Message not found");
    }

    try {
      await sendEmail({
        to: message.email,
        subject: `Re: ${message.subject}`,
        text: replyData.content,
      });
    } catch (error) {
      console.error("Error sending reply email:", error);
    }

    return message;
  }

  async getUnreadMessagesCount() {
    const count = await contactRepository.countUnreadMessages();
    return { count };
  }

  async getAllMessagesAdmin() {
    const messages = await contactRepository.findAllMessages();
    return messages;
  }
}

export default new ContactService();
