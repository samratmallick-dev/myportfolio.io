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
            fileSize: "auto", 
            files: 10, 
      },
});

export { upload };
