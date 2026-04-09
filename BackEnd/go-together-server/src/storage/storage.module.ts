import { Module } from "@nestjs/common";
import { CloudinaryProvider } from "./cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";
import { StorageController } from "./storage.controller";
import { S3Service } from "./s3.service";

@Module({
  providers: [CloudinaryProvider, CloudinaryService, S3Service],
  controllers: [StorageController],
  exports: [CloudinaryService, S3Service],
})
export class StorageModule {}
