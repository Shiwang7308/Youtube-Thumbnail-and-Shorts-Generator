'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Info, Github, Linkedin, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThumbnailForm } from '@/components/ThumbnailForm';
import { ThumbnailPreview } from '@/components/ThumbnailPreview';
import type { GeneratedImages, ThumbnailFormData } from '@/types';

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [generatedImages, setGeneratedImages] = React.useState<GeneratedImages>({
    horizontal: [],
    vertical: [],
    zip: undefined
  });

  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Authentication check
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Theme handling
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to results
  React.useEffect(() => {
    if (generatedImages.horizontal.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedImages]);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E50914] mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render the page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (formData: ThumbnailFormData) => {
    setLoading(true);
    const toastId = toast.loading('Generating your thumbnails...');

    try {
      const data = new FormData();
      data.append('image', formData.imageFile as File);
      data.append('topic', formData.topic);
      data.append('style', formData.style);
      data.append('placement', formData.placement);
      data.append('variants', formData.variants.toString());
      
      if (formData.thumbnailText) {
        data.append('thumbnailText', formData.thumbnailText);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Server error: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setGeneratedImages(result.images);
      toast.success('Thumbnails generated successfully!', { id: toastId });
    } catch (err: any) {
      console.error('Generation error:', err);
      toast.error(err.message || 'Failed to generate thumbnails', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!generatedImages.zip) return;

    const link = document.createElement('a');
    link.href = generatedImages.zip;
    link.download = 'thumbnails.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async (src: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Clipboard error:', err);
      toast.error('Failed to copy image');
    }
  };

  const handleShare = async (src: string) => {
    try {
      if (navigator.share) {
        const response = await fetch(src);
        const blob = await response.blob();
        const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: 'Check out my YouTube thumbnail!',
        });
      } else {
        throw new Error('Share not supported');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Sharing not supported on this device');
    }
  };

  const handleEdit = (src: string) => {
    // Implement edit functionality in future update
    toast('Edit feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0F0F0F]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#272727] transition-all duration-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-black tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E50914] to-[#FF4D4D] animate-gradient">
                  ThumbCraft
                </span>
                <span className="text-[#E50914]">AI</span>
              </h1>
            </Link>
            <button
              onClick={() => toast('AI-powered thumbnail generator for YouTube creators')}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-all duration-200"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-900 dark:text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-900 dark:text-white" />
                )
              ) : null}
            </button>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('userEmail');
                  toast.success('Logged out successfully');
                  window.location.href = '/';
                } catch (error) {
                  toast.error('Failed to logout');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Create Stunning YouTube
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E50914] to-[#FF4D4D]">
                Thumbnails with AI
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Upload your photo, describe your video content, and let AI create professional thumbnails optimized for both YouTube and Shorts.
            </p>
          </div>

          {/* Form Section */}
          <ThumbnailForm onSubmit={handleSubmit} loading={loading} />

          {/* Results Section */}
          {(loading || generatedImages.horizontal.length > 0) && (
            <div ref={resultsRef}>
              <ThumbnailPreview
                images={generatedImages}
                loading={loading}
                onDownloadAll={handleDownloadAll}
                onCopyToClipboard={handleCopyToClipboard}
                onShare={handleShare}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-500" style={{ fontFamily: 'Netflix Sans, Bebas Neue, sans-serif' }}>
                ThumbCraft AI
              </h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Crafting the future of YouTube thumbnails with AI
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com/Shiwang7308"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/gupta-shiwang-7308"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://x.com/shiwang7308"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created with ❤️ by Shiwang
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

