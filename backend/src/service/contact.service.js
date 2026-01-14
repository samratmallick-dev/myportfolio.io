import Logger from "../config/logger/logger.config.js";
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
            // Save message to database first
            const message = await contactRepository.createMessage(messageData);

            // Check total message count and delete oldest messages if exceeds 20
            const totalMessages = await contactRepository.countMessages();
            if (totalMessages > 20) {
                  const allMessages = await contactRepository.findAllMessages();
                  const messagesToDelete = allMessages.slice(20);

                  for (const msg of messagesToDelete) {
                        await contactRepository.deleteMessageById(msg._id);
                  }
            }

            this.sendEmailNotificationsAsync(messageData).catch(error => {
                  Logger.error("Background email sending failed", {
                        error: error.message,
                        stack: error.stack,
                        userEmail: messageData.email,
                        userName: messageData.name
                  });
            });

            return message;
      }

      // Separate async method for email sending (runs in background)
      async sendEmailNotificationsAsync(messageData) {
            try {
                  Logger.info("Starting background email notifications", {
                        userEmail: messageData.email,
                        userName: messageData.name
                  });

                  const contactDetails = await contactRepository.findActiveContactDetails();

                  const emailPromises = [
                        sendEmail({
                              to: messageData.email,
                              subject: "Message Received - Thank You",
                              text: `Dear ${messageData.name},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nYour message:\n${messageData.message}\n\nBest regards,\nThe Team`,
                              html: `
                                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                          <h2 style="color: #333;">Thank You for Contacting Us!</h2>
                                          <p>Dear ${messageData.name},</p>
                                          <p>We have received your message and will get back to you soon.</p>
                                          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                                <h3 style="margin-top: 0;">Your Message:</h3>
                                                <p>${messageData.message}</p>
                                          </div>
                                          <p>Best regards,<br>The Team</p>
                                    </div>
                              `
                        }).then(() => {
                              Logger.info(`Confirmation email sent successfully to ${messageData.email}`);
                              return { type: 'user', success: true };
                        }),

                        contactDetails && contactDetails.email ?
                              sendEmail({
                                    to: contactDetails.email,
                                    subject: `New Contact Message from ${messageData.name}`,
                                    text: `You have received a new message from ${messageData.name} (${messageData.email}):\n\nMobile: ${messageData.mobile || 'Not provided'}\nMessage: ${messageData.message}`,
                                    html: `
                                          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                                <h2 style="color: #333;">New Contact Message</h2>
                                                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                                      <p><strong>From:</strong> ${messageData.name}</p>
                                                      <p><strong>Email:</strong> ${messageData.email}</p>
                                                      <p><strong>Mobile:</strong> ${messageData.mobile || 'Not provided'}</p>
                                                      <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                                                      <p><strong>Message:</strong></p>
                                                      <p>${messageData.message}</p>
                                                </div>
                                          </div>
                                    `
                              }).then(() => {
                                    Logger.info(`Notification email sent successfully to admin: ${contactDetails.email}`);
                                    return { type: 'admin', success: true };
                              })
                              : Promise.resolve({ type: 'admin', success: false, reason: 'No admin email configured' })
                  ];

                  const results = await Promise.allSettled(emailPromises);

                  results.forEach((result, index) => {
                        if (result.status === 'fulfilled') {
                              Logger.info(`Email ${index + 1} completed`, result.value);
                        } else {
                              Logger.error(`Email ${index + 1} failed`, {
                                    error: result.reason?.message || result.reason,
                                    stack: result.reason?.stack
                              });
                        }
                  });

                  Logger.info("Background email notifications completed", {
                        userEmail: messageData.email,
                        results: results.map(r => r.status)
                  });

            } catch (error) {
                  Logger.error("Critical error in email notification process", {
                        error: error.message,
                        stack: error.stack,
                        userEmail: messageData.email,
                        userName: messageData.name
                  });

            }
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