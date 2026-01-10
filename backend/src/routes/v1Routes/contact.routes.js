import { Router } from "express";
import contactController from "../../controllers/contact.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

router.post("/add-update-contact-details", authenticate, upload.array("images", 3), contactController.addUpdateContactDetails);
router.get("/get-contact-details", contactController.getContactDetails);
router.put("/update-contact-details/:id", authenticate, upload.array("images", 3), contactController.updateContactDetails);
router.post("/send-message", contactController.sendMessage);
router.get("/get-all-messages", authenticate, contactController.getAllMessages);
router.get("/get-message/:messageId", authenticate, contactController.getMessageById);
router.delete("/delete-message/:messageId", authenticate, contactController.deleteMessage);
router.put("/mark-as-read/:messageId", authenticate, contactController.markMessageAsRead);
router.post("/reply/:messageId", authenticate, contactController.replyToMessage);
router.get("/get-unread-count", authenticate, contactController.getUnreadMessagesCount);
router.get("/get-all-messages-admin", authenticate, contactController.getAllMessagesAdmin);

export default router;
