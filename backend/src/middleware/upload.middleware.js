import multer from "multer";
import ApiError from "../utilities/error/apiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

      if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
      } else {
            cb(ApiError.badRequest(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF are allowed.`), false);
      }
};

const upload = multer({
      storage,
      fileFilter,
      limits: {
            fileSize: 20 * 1024 * 1024, // 20MB limit
            files: 10, // Maximum 10 files
      },
});

export { upload };
