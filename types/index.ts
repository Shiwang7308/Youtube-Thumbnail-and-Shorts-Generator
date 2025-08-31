export interface ThumbnailFormData {
  topic: string;
  style: string;
  placement: 'left' | 'center' | 'right';
  imageFile: File | null;
  sampleImage: string;
  tone: 'professional' | 'casual' | 'energetic' | 'dramatic' | 'playful' | 'mysterious' | 'inspirational' | 'luxurious' | 'educational' | 'authentic';
  variants: number;
  channelStyle?: string;
}

export interface GeneratedImages {
  horizontal: string[];
  vertical: string[];
  zip?: string;
}

export interface ApiResponse {
  images: GeneratedImages;
  error?: string;
}

export interface ShareOptions {
  title?: string;
  description?: string;
  image: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultStyle?: string;
  defaultPlacement?: 'left' | 'right' | 'center';
  saveHistory?: boolean;
}

export interface ThumbnailHistory {
  id: string;
  createdAt: string;
  options: ThumbnailFormData;
  images: GeneratedImages;
}
