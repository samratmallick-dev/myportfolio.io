import contactService from "../service/contact.service.js";
import { sendSuccess, sendCreated } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";

class ContactController {
      addUpdateContactDetails = asyncHandler(async (req, res) => {
            const contactData = req.body;
            const image = req.file;

            const contact = await contactService.addUpdateContactDetails(contactData, image);

            sendSuccess(res, "Contact details updated successfully", contact);
      });

      getContactDetails = asyncHandler(async (req, res) => {
            const contact = await contactService.getContactDetails();

            sendSuccess(res, "Contact details retrieved successfully", contact);
      });

      updateContactDetails = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const contactData = req.body;
            const image = req.file;

            const contact = await contactService.updateContactDetails(id, contactData, image);

            sendSuccess(res, "Contact details updated successfully", contact);
      });

      sendMessage = asyncHandler(async (req, res) => {
            const messageData = req.body;

            const message = await contactService.sendMessage(messageData);

            sendCreated(res, "Message sent successfully. You will receive a confirmation email shortly.", message);
      });

      getAllMessages = asyncHandler(async (req, res) => {
            const messages = await contactService.getAllMessages();

            sendSuccess(res, "Messages retrieved successfully", messages);
      });

      getMessageById = asyncHandler(async (req, res) => {
            const { messageId } = req.params;
            const message = await contactService.getMessageById(messageId);

            sendSuccess(res, "Message retrieved successfully", message);
      });

      deleteMessage = asyncHandler(async (req, res) => {
            const { messageId } = req.params;

            const result = await contactService.deleteMessage(messageId);

            sendSuccess(res, "Message deleted successfully", result);
      });

      markMessageAsRead = asyncHandler(async (req, res) => {
            const { messageId } = req.params;

            const message = await contactService.markMessageAsRead(messageId);

            sendSuccess(res, "Message marked as read", message);
      });

      getUnreadMessagesCount = asyncHandler(async (req, res) => {
            const count = await contactService.getUnreadMessagesCount();

            sendSuccess(res, "Unread messages count retrieved", count);
      });

      getAllMessagesAdmin = asyncHandler(async (req, res) => {
            const messages = await contactService.getAllMessagesAdmin();

            sendSuccess(res, "All messages retrieved successfully", messages);
      });
}

export default new ContactController();