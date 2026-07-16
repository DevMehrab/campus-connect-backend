import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folderName: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `campus_app/${folderName}`,
        fetch_format: "auto",
        quality: "auto"
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
