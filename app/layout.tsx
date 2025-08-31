import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "./ThemeProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThumbCraftAI | AI-Powered YouTube Thumbnail Generator",
  description: "Create stunning thumbnails for YouTube videos and Shorts with our AI-powered generator. Upload any photo and transform it into an attention-grabbing thumbnail in seconds.",
  keywords: "youtube thumbnail, ai thumbnail, youtube shorts, thumbnail generator, youtube creator tools, thumbcraft, ai tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
