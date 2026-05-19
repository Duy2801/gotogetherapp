import { api } from '../api';
import { getItem } from '../utils/storage';
import { KEY_STORAGE } from '../constants/KeyStorage';

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

      // Let axios set the correct multipart boundary header automatically
      const response = await api.post<UploadImageResponse>(`/upload/${type}`, formData);

      // response đã được interceptor xử lý, trả về response.data
      const result = response as unknown as UploadImageResponse;

      if (result.status && result.data?.url) {
        return result.data.url;
      }

      throw new Error('Upload failed');
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Upload error response:', error?.response);
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

      // Let axios set the correct multipart boundary header automatically
      try {
        const response = await api.post<UploadImageResponse>('/upload/avatar', formData);
        const result = response as unknown as UploadImageResponse;

        if (result.status && result.data?.url) {
          return result.data.url;
        }
        throw new Error('Upload failed');
      } catch (err: any) {
        // If axios network error on React Native, fall back to fetch implementation
        console.warn('Axios upload failed, trying fetch fallback:', err?.message);

        const token = await getItem(KEY_STORAGE.token);
        const uploadUrl = `${(api as any).defaults.baseURL}/upload/avatar`;

        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
          const fetchResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers,
            body: formData as any,
          });

          const json = await fetchResponse.json();
          if (json?.status && json?.data?.url) {
            return json.data.url;
          }
          throw new Error('Fetch upload failed');
        } catch (fetchErr: any) {
          console.error('Fetch avatar upload error:', fetchErr);
          throw fetchErr;
        }
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      console.error('Avatar upload error response:', error?.response);
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
