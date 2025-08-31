import React from 'react';
import { Film, Image, Palette, Pin, Wand2, ArrowRight, Loader2, Youtube, MonitorPlay } from 'lucide-react';
import { ThumbnailFormData } from '@/types';

interface ThumbnailFormProps {
  onSubmit: (data: ThumbnailFormData) => Promise<void>;
  loading: boolean;
}

export function ThumbnailForm({ onSubmit, loading }: ThumbnailFormProps) {
  const [formData, setFormData] = React.useState<ThumbnailFormData>({
    topic: '',
    style: '',
    placement: 'center',
    imageFile: null,
    sampleImage: '',
    variants: 1
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-[#1F1F1F] rounded-xl p-8 shadow-2xl border border-gray-200 dark:border-[#383838] transition-all duration-200">

      {/* Header Section */}
      <div className="text-center border-b border-gray-200 dark:border-[#383838] pb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your Thumbnail</h2>
        <p className="text-gray-600 dark:text-gray-400">Upload an image and customize your YouTube thumbnail style</p>
      </div>


      {/* Image Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Image className="w-5 h-5 text-[#E50914]" />
          Choose Image
        </h3>
        <div className="relative group">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-[#282828] border-gray-300 dark:border-[#383838] hover:border-[#E50914] dark:hover:border-[#E50914] dark:hover:bg-[#2F2F2F] transition-all duration-200"
          >
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain rounded-xl p-4" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium bg-[#E50914] px-4 py-2 rounded-lg">Click to change image</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Image className="w-10 h-10 mb-3 text-[#E50914] dark:text-[#E50914]" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG or JPG images</p>
              </div>
            )}
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        {/* Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Film className="w-5 h-5 text-[#E50914]" />
            Video Description
          </h3>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="e.g., Learn Python programming basics for beginners - complete tutorial with examples"
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Full video description for AI context</p>
        </div>

        {/* Thumbnail Text */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <MonitorPlay className="w-5 h-5 text-[#E50914]" />
            Thumbnail Text
          </h3>
          <input
            type="text"
            value={formData.thumbnailText || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, thumbnailText: e.target.value }))}
            placeholder="e.g., LEARN PYTHON or AUTO-GENERATE (leave empty for AI to create)"
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Optional:</span> Specific text for thumbnail. Leave empty for AI to generate catchy text from video description.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visual Style */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Palette className="w-5 h-5 text-[#E50914]" />
            Visual Style
          </h3>
          <select
            value={formData.style}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 transition-all group"
          >
            <option value="" disabled>Choose your aesthetic style</option>
            <option value="Modern and trendy">🌟 Modern & Trendy</option>
            <option value="Cinematic and dramatic">🎬 Cinematic & Dramatic</option>
            <option value="Clean and minimal">✨ Clean & Minimal</option>
            <option value="Bold and vibrant">💥 Bold & Vibrant</option>
            <option value="Professional and elegant">👔 Professional & Elegant</option>
            <option value="Creative and artistic">🎨 Creative & Artistic</option>
            <option value="Energetic and dynamic">⚡ Energetic & Dynamic</option>
            <option value="Luxury and premium">💎 Luxury & Premium</option>
            <option value="Fun and playful">🎉 Fun & Playful</option>
            <option value="Dark and mysterious">🌙 Dark & Mysterious</option>
            <option value="Casual and authentic">😊 Casual & Authentic</option>
            <option value="Inspirational and motivating">🚀 Inspirational & Motivating</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">Overall look and feel of your thumbnail</p>
        </div>

        {/* Channel Category */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#E50914]" stroke="currentColor">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
            Content Category
          </h3>
          <select
            value={formData.channelStyle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, channelStyle: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 transition-all"
          >
            <option value="" disabled>What type of content is this?</option>
            <option value="Tech and gadgets">💻 Tech & Gadgets</option>
            <option value="Tutorial and educational">📚 Tutorial & Educational</option>
            <option value="Entertainment and vlogs">📹 Entertainment & Vlogs</option>
            <option value="Gaming and streaming">🎮 Gaming & Streaming</option>
            <option value="Business and professional">💼 Business & Professional</option>
            <option value="Lifestyle and fashion">👗 Lifestyle & Fashion</option>
            <option value="Music and performance">🎵 Music & Performance</option>
            <option value="Sports and fitness">🏃 Sports & Fitness</option>
            <option value="Food and cooking">🍳 Food & Cooking</option>
            <option value="Travel and adventure">✈️ Travel & Adventure</option>
            <option value="Art and creativity">🎭 Art & Creativity</option>
            <option value="News and commentary">📰 News & Commentary</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">Helps AI understand your content niche</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Placement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Pin className="w-5 h-5 text-[#E50914]" />
            Photo Placement
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(['left', 'center', 'right'] as const).map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, placement: position }))}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.placement === position
                    ? 'border-[#E50914] bg-[#E50914]/10 text-[#E50914]'
                    : 'border-gray-300 dark:border-[#383838] hover:border-[#E50914] text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium capitalize">{position}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Position of your photo in the thumbnail</p>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#E50914]" fill="currentColor">
              <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
            </svg>
            Number of Variants
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, variants: count }))}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.variants === count
                    ? 'border-[#E50914] bg-[#E50914]/10 text-[#E50914]'
                    : 'border-gray-300 dark:border-[#383838] hover:border-[#E50914] text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs">Variant{count > 1 ? 's' : ''}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Generate multiple design variations</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-[#383838]">
        <button
          type="submit"
          disabled={loading || !formData.imageFile || !formData.topic || !formData.style}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#E50914] to-[#CC0000] hover:from-[#CC0000] hover:to-[#B30000] text-white font-semibold py-4 px-6 rounded-xl disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg transform"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating {formData.variants} Thumbnail{formData.variants > 1 ? 's' : ''}...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate {formData.variants} Professional Thumbnail{formData.variants > 1 ? 's' : ''}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        
        {/* Form requirements */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Required: Image upload, video description, and visual style
          </p>
        </div>
      </div>
    </form>
  );
}
