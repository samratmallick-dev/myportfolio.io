import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUD_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUD_API_SECRET;


if (!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)) {
      throw new Error("❌ Cloudinary configuration is missing");
}

cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
});

const fileToBuffer = async (file) => {
      if (!file) return null;

      if (file.buffer) return file.buffer;

      if (file.arrayBuffer) {
            const arrayBuffer = await file.arrayBuffer();
            return Buffer.from(arrayBuffer);
      }

      return null;
};

export const uploadToCloudinary = async (file, options = {}) => {
      try {
            const buffer = await fileToBuffer(file);
            if (!buffer) {
                  throw new Error("Invalid file format");
            }

            return await new Promise((resolve, reject) => {
                  const uploadOptions = {
                        resource_type: "auto",
                        folder: options.folder || "portfolio",
                        public_id: options.public_id,
                        overwrite: options.overwrite ?? false,
                        ...options,
                  };

                  const uploadStream = cloudinary.uploader.upload_stream(
                        uploadOptions,
                        (error, result) => {
                              if (error) return reject(error);
                              resolve(result);
                        }
                  );

                  uploadStream.end(buffer);
            });
      } catch (error) {
            throw new Error(`Cloudinary upload failed: ${error.message}`);
      }
};

export const deleteFromCloudinary = async (
      publicId,
      resourceType = "image"
) => {
      try {
            return await cloudinary.uploader.destroy(publicId, {
                  resource_type: resourceType,
            });
      } catch (error) {
            throw new Error(`Cloudinary deletion failed: ${error.message}`);
      }
};