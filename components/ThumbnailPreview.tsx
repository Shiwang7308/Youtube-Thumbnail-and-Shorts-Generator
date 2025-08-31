import React from 'react';
import { Download, Copy, Share2 } from 'lucide-react';
import { GeneratedImages } from '@/types';

interface ThumbnailPreviewProps {
  images: GeneratedImages;
  onDownloadAll: () => void;
  onCopyToClipboard: (src: string) => Promise<void>;
  onShare: (src: string) => void;
  loading?: boolean;
}

export function ThumbnailPreview({
  images,
  onDownloadAll,
  onCopyToClipboard,
  onShare,
  loading = false
}: ThumbnailPreviewProps) {
  return (
    <div className="space-y-12 pt-8">
      <div className="flex justify-between items-center sticky top-20 z-10 bg-white dark:bg-[#0F0F0F] pb-4">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Generated Thumbnails</h3>
        <button
          onClick={onDownloadAll}
          className="px-6 py-2.5 bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium hover:scale-105"
          disabled={loading}
        >
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      {/* Horizontal Thumbnails */}
      <div className="space-y-6">
        <h4 className="text-2xl font-semibold flex items-center gap-2">
          <span>YouTube Videos</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">(16:9)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading
            ? Array.from({ length: Math.max(1, images.horizontal.length || 1) }).map((_, i) => (
                <div key={i} className="aspect-video bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded-xl shadow-2xl" />
              ))
            : images.horizontal.map((src, i) => (
                <ThumbnailCard
                  key={`h-${i}`}
                  src={src}
                  index={i}
                  type="horizontal"
                  onCopyToClipboard={onCopyToClipboard}
                  onShare={onShare}
                />
              ))}
        </div>
      </div>

      {/* Vertical Thumbnails */}
      <div className="space-y-6">
        <h4 className="text-2xl font-semibold flex items-center gap-2">
          <span>Shorts & Reels</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">(9:16)</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: Math.max(1, images.vertical.length || 1) }).map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded-xl shadow-2xl" />
              ))
            : images.vertical.map((src, i) => (
                <ThumbnailCard
                  key={`v-${i}`}
                  src={src}
                  index={i}
                  type="vertical"
                  onCopyToClipboard={onCopyToClipboard}
                  onShare={onShare}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

interface ThumbnailCardProps {
  src: string;
  index: number;
  type: 'horizontal' | 'vertical';
  onCopyToClipboard: (src: string) => Promise<void>;
  onShare: (src: string) => void;
}

function ThumbnailCard({ src, index, type, onCopyToClipboard, onShare }: ThumbnailCardProps) {
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // For base64 images
      if (src.startsWith('data:image')) {
        const base64Data = src.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: 'image/jpeg' });
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      } else {
        // For URL images
        const response = await fetch(src);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      }
      onCopyToClipboard(src);
    } catch (err) {
      console.error('Failed to copy:', err);
      // If clipboard API fails, create a temporary element to copy to clipboard
      const img = document.createElement('img');
      img.src = src;
      img.style.position = 'fixed';
      img.style.left = '-9999px';
      document.body.appendChild(img);

      try {
        const range = document.createRange();
        range.selectNode(img);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          selection.removeAllRanges();
        }
      } finally {
        document.body.removeChild(img);
      }
    }
  };

  // YouTube-inspired style for action buttons
  const ActionButton = ({ onClick, icon, label, download }: any) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 
        ${type === 'horizontal' 
          ? 'px-2 py-1.5 text-xs' 
          : 'px-2.5 py-2 text-sm'
        }
        text-white font-medium rounded-md
        bg-black/60 hover:bg-black/80
        backdrop-blur-md transition-all duration-200
        hover:scale-105 whitespace-nowrap
        max-w-[110px] truncate
      `}
      title={label}
      {...(download ? {
        as: 'a',
        href: src,
        download: `${type}_thumbnail_${index + 1}.jpg`
      } : {})}
    >
      {React.cloneElement(icon, { 
        className: type === 'horizontal' ? 'w-3.5 h-3.5' : 'w-4 h-4'
      })}
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <div 
      className={`
        group relative overflow-hidden
        ${type === 'horizontal' 
          ? 'rounded-xl aspect-video' 
          : 'rounded-lg aspect-[9/16]'
        }
        bg-gradient-to-br from-gray-900 to-black
        transform transition-all duration-300 hover:scale-[1.02]
        shadow-xl hover:shadow-2xl
      `}
    >
      <img 
        src={src} 
        alt={`${type} thumbnail ${index + 1}`} 
        className="w-full h-full object-cover" 
        loading="lazy"
      />
      
      {/* Hover Overlay with YouTube-style gradient */}
      <div className="
        absolute inset-0 
        bg-gradient-to-t 
        from-black via-black/50 to-transparent
        opacity-0 group-hover:opacity-100 
        transition-all duration-300
      ">
        {/* Action Buttons Container */}
        <div className={`
          absolute 
          ${type === 'horizontal' 
            ? 'bottom-3 left-3 right-3 flex justify-start items-center gap-2' 
            : 'bottom-4 left-2 right-2 flex justify-center gap-2'
          }
          z-10
        `}>
          <ActionButton
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              const link = document.createElement('a');
              link.href = src;
              link.download = `${type}_thumbnail_${index + 1}.jpg`;
              link.click();
            }}
            icon={<Download className={type === 'horizontal' ? 'w-5 h-5' : 'w-4 h-4'} />}
            label="Download"
          />

          <ActionButton
            onClick={() => onShare(src)}
            icon={<Share2 className={type === 'horizontal' ? 'w-5 h-5' : 'w-4 h-4'} />}
            label="Share"
          />
        </div>
      </div>
    </div>
  );
}
