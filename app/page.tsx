'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Youtube, MonitorPlay, Sparkles, Gauge, Star, Zap, Layout, Image as ImageIcon, Github, Linkedin, Twitter, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Theme handling
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const exampleThumbnails = [
    { src: '/example1.jpg', title: 'Tech Review', category: 'Technology' },
    { src: '/example2.jpg', title: 'Motivation Video', category: 'Self Development' },
    { src: '/example3.jpg', title: 'Education Tutorial', category: 'Teaching' },
    { src: '/example4.jpg', title: 'Friend Marriage', category: 'Vlog' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black text-gray-900 dark:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-500" style={{ fontFamily: 'Netflix Sans, Bebas Neue, sans-serif' }}>
            ThumbCraft AI
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/generate')}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Create Thumbnail
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {mounted && (
                theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-purple-500/10 dark:from-red-900/20 dark:to-purple-900/20" />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold" style={{ fontFamily: 'Netflix Sans, Bebas Neue, sans-serif' }}>
                  <span className="text-red-600" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    ThumbCraft AI
                  </span>
                </h2>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    Create Stunning
                    <br />
                    YouTube Thumbnails
                  </span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                Transform your video content with AI-powered thumbnails that capture attention and drive clicks. Perfect for creators of all niches.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button 
                  onClick={() => router.push('/generate')}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-red-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Creating
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                <button 
                  onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  View Examples
                </button>
              </div>
            </motion.div>

            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden">
                {/* Abstract Shapes */}
                <motion.div 
                  className="absolute top-0 right-0 w-64 h-64 bg-red-500/30 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <motion.div 
                  className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                {/* Grid Pattern */}
                <div className="absolute inset-0" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
                  backgroundSize: "40px 40px"
                }} />
                
                {/* Content */}
                <div className="relative z-10 h-full flex items-center justify-center">
                  <motion.div 
                    className="p-8 rounded-xl bg-black/30 backdrop-blur-xl border border-white/10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>
                        {`>> Generating thumbnail...
>> Analyzing content...
>> Applying AI enhancements...
>> Creating variations...
✨ Success! Thumbnail ready.`}
                      </code>
                    </pre>
                  </motion.div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-1/4 right-1/4 w-20 h-20 rounded-lg overflow-hidden shadow-2xl"
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-purple-600" />
                </motion.div>

                <motion.div
                  className="absolute bottom-1/4 left-1/3 w-16 h-16 rounded-full overflow-hidden shadow-2xl"
                  animate={{ 
                    y: [0, 20, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ImageIcon className="w-8 h-8" />,
                title: 'Smart Composition',
                description: 'AI analyzes your image and creates the perfect layout automatically.'
              },
              {
                icon: <Layout className="w-8 h-8" />,
                title: 'Multiple Formats',
                description: 'Generate thumbnails for standard videos, Shorts, and more.'
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: 'Style Variants',
                description: 'Choose from various pre-made styles or create your own.'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Instant Results',
                description: 'Get multiple variations in seconds with our optimized AI.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center mb-6 text-red-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Thumbnails */}
      <section id="examples" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Example Thumbnails
            </span>
          </motion.h2>

          <motion.div 
            className="thumbnail-slider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Slider
              className="max-w-7xl mx-auto"
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={3}
              slidesToScroll={1}
              centerMode={true}
              centerPadding="0px"
              autoplay={true}
              autoplaySpeed={3000}
              pauseOnHover={true}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    centerMode: false
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 1,
                    centerMode: false
                  }
                }
              ]}
            >
              {exampleThumbnails.map((thumb, i) => (
                <div key={i} className="px-2">
                  <motion.div
                    className="thumbnail-card hover-lift"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={thumb.src}
                        alt={thumb.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="thumbnail-overlay">
                        <div className="space-y-2">
                          <p className="text-red-400 text-sm font-medium">{thumb.category}</p>
                          <h3 className="text-white text-xl font-bold">{thumb.title}</h3>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-purple-800/30 dark:from-red-900/30 dark:to-purple-900/40" />
        <div className="container relative mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Elevate Your YouTube Content
            </h2>
            <p className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
              Join the community of successful creators who use AI to create 
              <span className="text-red-600 dark:text-red-500 font-semibold"> stunning thumbnails </span>
              that drive engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={() => router.push('/generate')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-red-600 to-purple-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Creating Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <span className="text-gray-500 dark:text-gray-400">No credit card required</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-500" style={{ fontFamily: 'Netflix Sans, Bebas Neue, sans-serif' }}>
              ThumbCraft AI
            </h3>
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
