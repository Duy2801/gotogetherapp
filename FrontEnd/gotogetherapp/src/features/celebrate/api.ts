import { api, ApiError } from '../../api';

export interface CelebrateTrip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  images?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
}

export interface CelebrateUser {
  id: string;
  fullName?: string;
  avatar?: string;
}

export interface CelebrateImage {
  id: string;
  imageUrl: string;
  createdAt?: string;
}

export interface CelebrateItem {
  id: string;
  tripId: string;
  userId: string;
  description?: string;
  date: string;
  createdAt?: string;
  trip?: CelebrateTrip;
  user?: CelebrateUser;
  images?: CelebrateImage[];
}

export interface CelebrateComment {
  id: string;
  celebrateId: string;
  userId: string;
  content: string;
  createdAt?: string;
  user?: CelebrateUser;
}

export interface CelebrateReaction {
  id: string;
  celebrateId: string;
  emoji: string;
  count: number;
  reactedByMe?: boolean;
}

export interface ReactionSummary {
  counts: Record<string, number>;
  userReactions: string[];
}

interface CelebrateApiResponse {
  status: boolean;
  data: CelebrateItem | CelebrateItem[] | null;
}

export interface CreateCelebratePayload {
  tripId: string;
  date: string;
  description: string;
  images?: string[];
}

export interface UpdateCelebratePayload {
  date?: string;
  description?: string;
  images?: string[];
}

export const celebrateApi = {
  getCelebrations: async (): Promise<CelebrateItem[]> => {
    try {
      const response = await api.get('/celebrate');

      // `api` normalizes responses in interceptor and often returns the
      // payload directly. Support both shapes: payload or { data: payload }.
      const payload = (response as any)?.data ?? response;

      if (Array.isArray(payload)) return payload as CelebrateItem[];
      if (payload) return [payload as CelebrateItem];
      return [];
    } catch (error) {
      throw error as ApiError;
    }
  },

  createCelebrate: async (
    payload: CreateCelebratePayload,
  ): Promise<CelebrateItem> => {
    try {
      const response = (await api.post('/celebrate', payload)) as {
        status: boolean;
        data: CelebrateItem;
      };
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  updateCelebrate: async (
    celebrateId: string,
    payload: UpdateCelebratePayload,
  ): Promise<CelebrateItem> => {
    try {
      const response = (await api.put(
        `/celebrate/${celebrateId}`,
        payload,
      )) as {
        status: boolean;
        data: CelebrateItem;
      };
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  // Comments & reactions
  getComments: async (celebrateId: string): Promise<CelebrateComment[]> => {
    try {
      const response = await api.get(`/celebrate/${celebrateId}/comments`);
      return (response as any) || [];
    } catch (error) {
      throw error as ApiError;
    }
  },

  getReactions: async (celebrateId: string): Promise<ReactionSummary> => {
    try {
      const response = await api.get(`/celebrate/${celebrateId}/reactions`);
      return (response as any) || { counts: {}, userReactions: [] };
    } catch (error) {
      throw error as ApiError;
    }
  },

  createComment: async (
    celebrateId: string,
    content: string,
  ): Promise<CelebrateComment> => {
    try {
      const response = await api.post(`/celebrate/${celebrateId}/comments`, {
        content,
      });
      return response as any;
    } catch (error) {
      throw error as ApiError;
    }
  },

  toggleReaction: async (
    celebrateId: string,
    emoji: string,
  ): Promise<ReactionSummary> => {
    try {
      const response = await api.post(`/celebrate/${celebrateId}/reactions`, {
        emoji,
      });
      return (response as any) || { counts: {}, userReactions: [] };
    } catch (error) {
      throw error as ApiError;
    }
  },
};
