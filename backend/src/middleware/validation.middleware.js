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

const validateProject = [
      body("title").notEmpty().withMessage("Title is required").isLength({ max: 200 }).withMessage("Title must not exceed 200 characters"),
      body("description").notEmpty().withMessage("Description is required"),
      body("technologies").isArray({ min: 1 }).withMessage("At least one technology is required"),
      body("category").notEmpty().withMessage("Category is required"),
];

const validateEducation = [
      body("institution").notEmpty().withMessage("Institution is required"),
      body("degree").notEmpty().withMessage("Degree is required"),
      body("field").notEmpty().withMessage("Field of study is required"),
      body("startDate").isISO8601().withMessage("Start date must be a valid date"),
];

const validateSkillCategory = [
      body("category").notEmpty().withMessage("Category name is required"),
];

const validateSkill = [
      body("name").notEmpty().withMessage("Skill name is required"),
      body("level").isInt({ min: 0, max: 100 }).withMessage("Skill level must be between 0 and 100"),
];

const validateService = [
      body("title").notEmpty().withMessage("Service title is required"),
      body("description").notEmpty().withMessage("Service description is required"),
];

const validateContactMessage = [
      body("name").notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must not exceed 100 characters"),
      body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
      body("subject").notEmpty().withMessage("Subject is required").isLength({ max: 200 }).withMessage("Subject must not exceed 200 characters"),
      body("message").notEmpty().withMessage("Message is required").isLength({ max: 2000 }).withMessage("Message must not exceed 2000 characters"),
];

const validateOTP = [
      otpRule(),
];

const validateEmailUpdate = [
      body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
      otpRule(),
];

const validatePasswordUpdate = [
      body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
      otpRule(),
];

export {
      handleValidationErrors,
      validateLogin,
      validateAdminInitialization,
      validateMongoId,
      validateProject,
      validateEducation,
      validateSkillCategory,
      validateSkill,
      validateService,
      validateContactMessage,
      validateOTP,
      validateEmailUpdate,
      validatePasswordUpdate,
};
