import Logger from "../config/logger/logger.config.js";
import contactRepository from "../repository/contact.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";
import emailService from "../utilities/email/email.service.js";
import templateService from "../utilities/email/template.service.js";

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
                        // Send acknowledgment to user
                        (async () => {
                              const html = await templateService.render('contact-acknowledgment', {
                                    name: messageData.name,
                                    subject: 'Contact Form Submission',
                                    message: messageData.message,
                                    date: new Date().toLocaleDateString(),
                                    senderName: 'Portfolio Team'
                              });
                              
                              return emailService.sendMail({
                                    to: messageData.email,
                                    subject: "Message Received - Thank You",
                                    html: html,
                                    text: `Dear ${messageData.name},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nYour message:\n${messageData.message}\n\nBest regards,\nThe Team`
                              });
                        })().then(() => {
                              Logger.info(`Confirmation email sent successfully to ${messageData.email}`);
                              return { type: 'user', success: true };
                        }),

                        // Send notification to admin
                        contactDetails && contactDetails.email ?
                              (async () => {
                                    const html = await templateService.render('contact-notification', {
                                          name: messageData.name,
                                          email: messageData.email,
                                          mobile: messageData.mobile || 'Not provided',
                                          subject: 'Contact Form Submission',
                                          message: messageData.message,
                                          date: new Date().toLocaleString()
                                    });
                                    
                                    return emailService.sendMail({
                                          to: contactDetails.email,
                                          subject: `New Contact Message from ${messageData.name}`,
                                          html: html,
                                          text: `You have received a new message from ${messageData.name} (${messageData.email}):\n\nMobile: ${messageData.mobile || 'Not provided'}\nMessage: ${messageData.message}`
                                    });
                              })().then(() => {
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