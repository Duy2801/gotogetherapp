import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  private readonly region: string;
  private readonly bucket: string;
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.region =
      this.configService.get<string>("AWS_REGION") || "ap-southeast-2";
    this.bucket = this.configService.get<string>("AWS_S3_BUCKET") || "";

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID") || "",
        secretAccessKey:
          this.configService.get<string>("AWS_SECRET_ACCESS_KEY") || "",
      },
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    if (!this.bucket) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }

    if (!file?.buffer?.length) {
      throw new Error("Avatar file is empty");
    }

    const fileExt = file.originalname?.split(".").pop() || "jpg";
    const key = `avatars/${userId}-${Date.now()}.${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype || "image/jpeg",
      CacheControl: "public, max-age=31536000",
    });

    await this.s3Client.send(command);

    const publicBaseUrl = this.configService.get<string>(
      "AWS_S3_PUBLIC_BASE_URL",
    );
    const url = publicBaseUrl
      ? `${publicBaseUrl}/${key}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return {
      key,
      url,
    };
  }
}
