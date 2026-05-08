import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);


export const uploadFileToCloudinary = (
    buffer:Buffer,
    filename:string
): Promise<UploadApiResponse>=>{
    const extension = filename.split('.')[1].toLowerCase()

    const filenameWithoutExtension = filename.split('.').slice(0,1).join('.').replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const uniqueName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      filenameWithoutExtension;
    const folder = extension == 'pdf'?'pdfs':'images'

    console.log('FILENAME',filename)
    console.log('EXTENSION',extension)
    console.log('FOLDER',folder)

    return new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream({
            resouce_type:"auto",
            public_id:`ecohub/${folder}/${uniqueName}`,
            folder:`ecohub/${folder}`
        },
        (error,result)=>{
            if(error){
                return reject(new AppError(status.INTERNAL_SERVER_ERROR,error.message))
            }else{
                return (resolve(result as UploadApiResponse))
            }
        }
    ).end(buffer)
    })
}

export const deleteFileFromCloudinary = async(url:string)=>{
    try{
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;

        const match = url.match(regex);

        if (match && match[1]) {
          const public_Id = match[1];
          await cloudinary.uploader.destroy(public_Id),
            {
              resource_type: "auto",
            };
        }
        console.log("deleted");

    }catch(err:any){
        console.error("Error deleting file from Cloudinary:", err);
        throw new AppError(
          status.INTERNAL_SERVER_ERROR,
          "Failed to delete file from Cloudinary"
        );
    }
}

export const cloudinaryUpload = cloudinary;