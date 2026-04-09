import { api } from '../api';

export interface UploadImageResponse {
  status: boolean;
  data: {
    url: string;
    publicId: string;
  };
}

export const uploadService = {
  /**
   * Upload ảnh lên Cloudinary thông qua backend
   * @param fileUri - Local file URI từ ImagePicker
   * @param type - Loại ảnh: 'image' | 'receipt' | 'photo'
   * @returns Promise với URL ảnh trên Cloudinary
   */
  uploadImage: async (
    fileUri: string,
    type: 'image' | 'receipt' | 'photo' = 'image',
  ): Promise<string> => {
    try {
      const formData = new FormData();

      const filename = fileUri.split('/').pop() || 'image.jpg';
      const fileType = filename.split('.').pop() || 'jpg';

      formData.append('file', {
        uri: fileUri,
        type: `image/${fileType}`,
        name: filename,
      } as any);

      const response = await api.post<UploadImageResponse>(
        `/upload/${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // response đã được interceptor xử lý, trả về response.data
      const result = response as unknown as UploadImageResponse;

      if (result.status && result.data?.url) {
        return result.data.url;
      }

      throw new Error('Upload failed');
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error?.message || 'Không thể upload ảnh');
    }
  },

  /**
   * Upload ảnh cho chuyến đi
   */
  uploadTripImage: async (fileUri: string): Promise<string> => {
    return uploadService.uploadImage(fileUri, 'image');
  },

  /**
   * Upload avatar người dùng lên S3
   */
  uploadAvatar: async (fileUri: string): Promise<string> => {
    try {
      const formData = new FormData();

      const filename = fileUri.split('/').pop() || 'avatar.jpg';
      const fileType = filename.split('.').pop() || 'jpg';

      formData.append('file', {
        uri: fileUri,
        type: `image/${fileType}`,
        name: filename,
      } as any);

      const response = await api.post<UploadImageResponse>(
        '/upload/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const result = response as unknown as UploadImageResponse;

      if (result.status && result.data?.url) {
        return result.data.url;
      }

      throw new Error('Upload failed');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      throw new Error(error?.message || 'Không thể upload avatar');
    }
  },

  /**
   * Upload ảnh hoá đơn
   */
  uploadReceipt: async (fileUri: string): Promise<string> => {
    return uploadService.uploadImage(fileUri, 'receipt');
  },

  /**
   * Upload ảnh kỷ niệm
   */
  uploadPhoto: async (fileUri: string): Promise<string> => {
    return uploadService.uploadImage(fileUri, 'photo');
  },
};
