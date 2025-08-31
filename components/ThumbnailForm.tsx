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
    tone: 'professional',
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

      <div className="grid md:grid-cols-2 gap-6">
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
            placeholder="e.g., Learn Python programming basics for beginners"
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all"
          />
        </div>



        {/* Style */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Palette className="w-5 h-5 text-[#E50914]" />
            Visual Style
          </h3>
          <select
            value={formData.style}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 transition-all"
          >
            <option value="" disabled>Select a style</option>
            <option value="Modern and trendy">Modern & Trendy</option>
            <option value="Cinematic and dramatic">Cinematic & Dramatic</option>
            <option value="Clean and minimal">Clean & Minimal</option>
            <option value="Bold and vibrant">Bold & Vibrant</option>
            <option value="Professional and elegant">Professional & Elegant</option>
            <option value="Creative and artistic">Creative & Artistic</option>
            <option value="Lifestyle and fashion">Lifestyle & Fashion</option>
            <option value="Gaming and esports">Gaming & Esports</option>
            <option value="Food and cooking">Food & Cooking</option>
            <option value="Travel and adventure">Travel & Adventure</option>
            <option value="Educational and informative">Educational & Informative</option>
            <option value="Vlog and personal">Vlog & Personal</option>
          </select>
        </div>

        {/* Brand Style */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#E50914]" stroke="currentColor">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
            Channel Style
          </h3>
          <select
            value={formData.channelStyle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, channelStyle: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 transition-all"
          >
            <option value="" disabled>Select channel style</option>
            <option value="Tech and gadgets">Tech & Gadgets</option>
            <option value="Tutorial and educational">Tutorial & Educational</option>
            <option value="Entertainment and vlogs">Entertainment & Vlogs</option>
            <option value="Gaming and streaming">Gaming & Streaming</option>
            <option value="Business and professional">Business & Professional</option>
            <option value="Lifestyle and fashion">Lifestyle & Fashion</option>
            <option value="Music and performance">Music & Performance</option>
            <option value="Sports and fitness">Sports & Fitness</option>
            <option value="Art and creativity">Art & Creativity</option>
            <option value="News and commentary">News & Commentary</option>
          </select>
        </div>

        {/* Tone */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Wand2 className="w-5 h-5 text-[#E50914]" />
            Content Tone
          </h3>
          <select
            value={formData.tone}
            onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value as ThumbnailFormData['tone'] }))}
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 transition-all"
          >
            <option value="professional">Professional & Polished</option>
            <option value="casual">Casual & Friendly</option>
            <option value="energetic">Energetic & Dynamic</option>
            <option value="dramatic">Dramatic & Intense</option>
            <option value="playful">Playful & Fun</option>
            <option value="mysterious">Mysterious & Intriguing</option>
            <option value="inspirational">Inspirational & Motivating</option>
            <option value="luxurious">Luxurious & Premium</option>
            <option value="educational">Educational & Informative</option>
            <option value="authentic">Authentic & Natural</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Placement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Pin className="w-5 h-5 text-[#E50914]" />
            Photo Placement
          </h3>
          <select
            value={formData.placement}
            onChange={(e) => setFormData(prev => ({ ...prev, placement: e.target.value as ThumbnailFormData['placement'] }))}
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 transition-all"
          >
            <option value="left">Left Side</option>
            <option value="center">Center</option>
            <option value="right">Right Side</option>
          </select>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#E50914]" fill="currentColor">
              <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
            </svg>
            Variants
          </h3>
          <select
            value={formData.variants}
            onChange={(e) => setFormData(prev => ({ ...prev, variants: parseInt(e.target.value) }))}
            className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-[#282828] text-gray-900 dark:text-white border-gray-300 dark:border-[#383838] hover:border-[#E50914] focus:border-[#E50914] focus:ring-0 transition-all"
          >
            <option value={1}>1 Variant</option>
            <option value={2}>2 Variants</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.imageFile || !formData.topic || !formData.style}
        className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#CC0000] text-white font-semibold py-3.5 px-6 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating {formData.variants} Variants...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Generate {formData.variants} Thumbnails
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
