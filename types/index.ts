export interface ThumbnailFormData {
  topic: string;
  style: string;
  placement: 'left' | 'center' | 'right';
  imageFile: File | null;
  sampleImage: string;
  variants: number;
  channelStyle?: string;
  thumbnailText?: string; // Optional specific text for thumbnail
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
