import { body, param, validationResult } from "express-validator";
import ApiError from "../utilities/error/apiError.js";

const handleValidationErrors = (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
            const messages = errors.array().map(err => err.msg);
            throw ApiError.badRequest(messages.join(", "));
      }

      next();
};


const otpRule = () => body("otp")
      .isNumeric()
      .withMessage("OTP must contain only numbers")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be exactly 6 digits");

const validateLogin = [
      body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
      body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

const validateAdminInitialization = [
      body("username").isLength({ min: 3, max: 50 }).withMessage("Username must be between 3 and 50 characters"),
      body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
      body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

const validateMongoId = [
      param("id").isMongoId().withMessage("Invalid ID format"),
];

const validateSkillIds = [
      param("categoryId").isMongoId().withMessage("Invalid category ID format"),
      param("skillId").isMongoId().withMessage("Invalid skill ID format"),
];

const validateEducation = [
      body("title").notEmpty().withMessage("Title is required"),
      body("description").notEmpty().withMessage("Description is required"),
      body("date").notEmpty().withMessage("Date is required"),
];
const validateService = [
      body("title").notEmpty().withMessage("Service title is required"),
      body("description").notEmpty().withMessage("Service description is required"),
      body("icon").notEmpty().withMessage("Icon is required"),
];

const validateContactMessage = [
      body("name").notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must not exceed 100 characters"),
      body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
      body("mobile").notEmpty().withMessage("Mobile is required").isLength({ max: 15 }).withMessage("Mobile must not exceed 15 characters"),
      body("message").notEmpty().withMessage("Message is required").isLength({ max: 2000 }).withMessage("Message must not exceed 2000 characters"),
];

const validateOTP = [
      otpRule(),
];

const validateEmailUpdate = [
      otpRule(),
];

const validateGenerateOTP = [
      body("newEmail").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
];

const validatePasswordUpdate = [
      body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
      otpRule(),
];

const validateContactDetails = [
      body("name").notEmpty().withMessage("Name is required"),
      body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
      body("mobile").notEmpty().withMessage("Mobile is required"),
      body("address").notEmpty().withMessage("Address is required"),
];

const validateSkillCategory = [
      body("category").notEmpty().withMessage("Category name is required").trim(),
];

const validateSkill = [
      body("name").notEmpty().withMessage("Skill name is required").trim(),
      body("level").isInt({ min: 0, max: 100 }).withMessage("Level must be between 0 and 100"),
      body("iconName").notEmpty().withMessage("Icon name is required"),
      body("iconColor").notEmpty().withMessage("Icon color is required"),
];

const validateProject = [
      body("title").notEmpty().withMessage("Title is required"),
      body("description").notEmpty().withMessage("Description is required"),
      body("technologies").custom((value) => {
            if (!value) return false;
            if (typeof value === 'string' && value.trim()) return true;
            if (Array.isArray(value) && value.length > 0) return true;
            return false;
      }).withMessage("Technologies is required"),
      body("status").optional().isIn(["Completed", "In Progress", "On Hold"]).withMessage("Invalid status"),
];

export {
      handleValidationErrors,
      validateLogin,
      validateAdminInitialization,
      validateMongoId,
      validateSkillIds,
      validateEducation,
      validateService,
      validateContactMessage,
      validateContactDetails,
      validateOTP,
      validateEmailUpdate,
      validatePasswordUpdate,
      validateGenerateOTP,
      validateSkillCategory,
      validateSkill,
      validateProject,
};
