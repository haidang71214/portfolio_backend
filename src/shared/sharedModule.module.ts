import { Module } from "@nestjs/common";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { CloudUploadService } from "./cloudinary.service";

@Module({
   imports:[CloudinaryModule],
   providers:[CloudUploadService],
   exports:[CloudUploadService]
})
export class ShareModule{}