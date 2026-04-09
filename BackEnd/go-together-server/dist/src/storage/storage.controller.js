"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const cloudinary_service_1 = require("./cloudinary.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StorageController = class StorageController {
    cloudinaryService;
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    async uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException("No file uploaded");
        }
        try {
            const result = await this.cloudinaryService.uploadImage(file, "gotogether/trips");
            return {
                status: true,
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException("Failed to upload image");
        }
    }
    async uploadReceipt(file) {
        if (!file) {
            throw new common_1.BadRequestException("No file uploaded");
        }
        try {
            const result = await this.cloudinaryService.uploadImage(file, "gotogether/receipts");
            return {
                status: true,
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException("Failed to upload receipt");
        }
    }
    async uploadPhoto(file) {
        if (!file) {
            throw new common_1.BadRequestException("No file uploaded");
        }
        try {
            const result = await this.cloudinaryService.uploadImage(file, "gotogether/photos");
            return {
                status: true,
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException("Failed to upload photo");
        }
    }
    async uploadAvatar(file, req) {
        if (!file) {
            throw new common_1.BadRequestException("No file uploaded");
        }
        try {
            if (!file.buffer || file.buffer.length === 0) {
                throw new common_1.BadRequestException("File buffer is empty");
            }
            const result = await this.cloudinaryService.uploadImage(file, "gotogether/avatars");
            if (!result || !result.secure_url) {
                throw new common_1.BadRequestException("Upload returned invalid response");
            }
            return {
                status: true,
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                },
            };
        }
        catch (error) {
            console.error("Avatar upload error details:", {
                message: error?.message,
                error: error?.error,
                statusCode: error?.statusCode,
                fullError: error,
            });
            throw new common_1.BadRequestException(error?.message ||
                "Failed to upload avatar. Please ensure Cloudinary is configured properly.");
        }
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)("image"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)("receipt"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadReceipt", null);
__decorate([
    (0, common_1.Post)("photo"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Post)("avatar"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadAvatar", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)("upload"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map