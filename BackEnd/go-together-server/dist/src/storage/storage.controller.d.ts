import { CloudinaryService } from "./cloudinary.service";
export declare class StorageController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    uploadImage(file: Express.Multer.File): Promise<{
        status: boolean;
        data: {
            url: any;
            publicId: any;
        };
    }>;
    uploadReceipt(file: Express.Multer.File): Promise<{
        status: boolean;
        data: {
            url: any;
            publicId: any;
        };
    }>;
    uploadPhoto(file: Express.Multer.File): Promise<{
        status: boolean;
        data: {
            url: any;
            publicId: any;
        };
    }>;
    uploadAvatar(file: Express.Multer.File, req: any): Promise<{
        status: boolean;
        data: {
            url: any;
            publicId: any;
        };
    }>;
}
