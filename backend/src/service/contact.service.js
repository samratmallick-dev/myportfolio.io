import contactRepository from "../repository/contact.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";
import { sendEmail } from "../utilities/email/sendEmail.js";

class ContactService {
      // Contact Details Methods
      async addUpdateContactDetails(contactData, image) {
            let contactDetails = await contactRepository.findActiveContactDetails();

            // Parse socialLinks if it's a string
            if (contactData.socialLinks && typeof contactData.socialLinks === 'string') {
                  try {
                        contactData.socialLinks = JSON.parse(contactData.socialLinks);
                  } catch (error) {
                        console.error('Error parsing socialLinks:', error);
                  }
            }

            if (image) {
                  const cloudinaryResponse = await uploadToCloudinary(image, "contact/images");
                  contactData.contactImage = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                  };
            }

            if (contactDetails) {
                  contactDetails = await contactRepository.updateContactDetails(contactDetails._id, contactData);
            } else {
                  contactDetails = await contactRepository.createContactDetails(contactData);
            }

            return contactDetails;
      }

      async getContactDetails() {
            const contactDetails = await contactRepository.findActiveContactDetails();

            if (!contactDetails) {
                  throw ApiError.notFound("Contact details not found");
            }

            return contactDetails;
      }

      async updateContactDetails(id, contactData, image) {
            const existingContact = await contactRepository.findContactDetails({ _id: id });

            if (!existingContact) {
                  throw ApiError.notFound("Contact details not found");
            }

            if (image) {
                  const cloudinaryResponse = await uploadToCloudinary(image, "contact/images");
                  contactData.contactImage = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                  };
            }

            const updatedContact = await contactRepository.updateContactDetails(id, contactData);
            return updatedContact;
      }

      // Message Methods
      async sendMessage(messageData) {
            const message = await contactRepository.createMessage(messageData);

            // Check total message count and delete oldest 20 if exceeds 20
            const totalMessages = await contactRepository.countMessages();
            if (totalMessages > 20) {
                  const allMessages = await contactRepository.findAllMessages();
                  const messagesToDelete = allMessages.slice(20); // Get messages after the first 20 (newest)
                  
                  for (const msg of messagesToDelete) {
                        await contactRepository.deleteMessageById(msg._id);
                  }
            }

            // Send emails without blocking the response
            setImmediate(async () => {
                  try {
                        await sendEmail({
                              to: messageData.email,
                              subject: "Message Received - Thank You",
                              text: `Thank you for contacting us. We have received your message and will get back to you soon.\n\nYour message:\n${messageData.message}`,
                        });

                        const contactDetails = await contactRepository.findActiveContactDetails();
                        if (contactDetails && contactDetails.email) {
                              await sendEmail({
                                    to: contactDetails.email,
                                    subject: `New Contact Message from ${messageData.name}`,
                                    text: `You have received a new message from ${messageData.name} (${messageData.email}):\n\nMobile: ${messageData.mobile}\nMessage: ${messageData.message}`,
                              });
                        }
                  } catch (error) {
                        console.error("Error sending notification emails:", error);
                  }
            });

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