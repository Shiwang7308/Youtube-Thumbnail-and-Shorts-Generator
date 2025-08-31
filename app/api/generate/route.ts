import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import archiver from 'archiver';
import mime from 'mime';
import sharp from 'sharp';

// Initialize AI clients
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY environment variable');
}

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Initialize the clients with optimized settings
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const genAI = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

// Helper functions
async function preProcessImage(buffer: Buffer, aspectRatio: "16:9" | "9:16"): Promise<Buffer> {
  // Calculate target dimensions based on aspect ratio (reduced for faster processing)
  let width: number, height: number;
  const MAX_DIMENSION = 768; // Reduced from 1024 for 33% faster processing

  if (aspectRatio === "16:9") {
    width = MAX_DIMENSION;
    height = Math.round(MAX_DIMENSION * (9/16));
  } else {
    height = MAX_DIMENSION;
    width = Math.round(MAX_DIMENSION * (9/16));
  }

  return sharp(buffer)
    .resize({
      width,
      height,
      fit: 'cover',
      position: 'attention' // Focus on the important part of the image
    })
    .jpeg({ quality: 90, mozjpeg: true }) // Balanced quality for accuracy
    .toBuffer();
}

async function postProcessImage(buffer: Buffer, aspectRatio: "16:9" | "9:16"): Promise<Buffer> {
  // Calculate final output dimensions
  let width: number, height: number;
  
  if (aspectRatio === "16:9") {
    width = 1920;
    height = 1080;
  } else {
    width = 1080;
    height = 1920;
  }

  return sharp(buffer)
    .resize({
      width,
      height,
      fit: 'fill'
    })
    .sharpen({ sigma: 0.5 })
    .modulate({ brightness: 1.05, saturation: 1.1 })
    .gamma(2.2)
    .toBuffer();
}

async function generateThumbnailText(videoDescription: string, style: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a YouTube thumbnail text expert. Create punchy, clickable thumbnail text that:
        1. Is 1-4 words maximum (CRITICAL - never exceed this)
        2. Uses ALL CAPS for maximum impact
        3. Creates curiosity and urgency
        4. Matches successful YouTube thumbnails
        5. Is highly readable even at small sizes
        
        Examples of GOOD thumbnail text:
        - "INSANE TRICK"
        - "YOU'RE WRONG"
        - "SHOCKING"
        - "MUST WATCH"
        - "NEW UPDATE"
        - "GAME OVER"
        
        NEVER use full sentences or long descriptions.`
      },
      {
        role: "user",
        content: `Create catchy thumbnail text for: "${videoDescription}"
        Style: ${style}
        
        Return ONLY the thumbnail text (1-4 words, ALL CAPS).`
      }
    ],
    temperature: 0.9, // High creativity for catchy text
    max_tokens: 20    // Very short response
  });

  return response.choices[0]?.message?.content?.trim() || 'WATCH NOW';
}

async function getCreativeDirection(topic: string, style: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Professional thumbnail designer. Provide concise creative direction focusing on:
        1. Lighting (3-point setup, angles, intensity)
        2. Background (style, depth, elements)
        3. Colors (palette, temperature)
        4. Typography (size, positioning)
        5. Composition (rule of thirds, focus)

        Keep it photorealistic. NO facial modifications.`
      },
      {
        role: "user",
        content: `Topic: "${topic}", Style: ${style}. Provide specific lighting, background, colors, typography, and composition guidance for professional results.`
      }
    ],
    temperature: 0.8, // Increased for faster generation
    max_tokens: 150   // Reduced by 25% for speed
  });

  return response.choices[0]?.message?.content || '';
}


async function generateWithGemini(
  prompt: string,
  imageBase64: string,
  aspectRatio: "16:9" | "9:16",
  topic: string,
  style: string,
  thumbnailText?: string // Optional custom thumbnail text
): Promise<string[]> {
  try {
    // Optimized configuration balancing speed with accuracy
    const config = {
      temperature: 0.7, // Balanced for quality and speed
      topP: 0.85, // Good balance for focused but creative outputs
      topK: 10, // Restored for better quality
      maxOutputTokens: 1800, // Increased slightly for better accuracy
      candidateCount: 1,
      responseModalities: ['IMAGE', 'TEXT']
    };

    // Get creative direction from GPT-4
    const creativeDirection = await getCreativeDirection(topic, style);
    
    // Generate or use provided thumbnail text
    const finalThumbnailText = thumbnailText || await generateThumbnailText(topic, style);
    console.log('Creative direction generated, thumbnail text:', finalThumbnailText);

    // Add aspect ratio specific instructions
      const aspectRatioInstructions = aspectRatio === "16:9"
        ? `Create a professional YouTube video thumbnail (1920x1080, 16:9 aspect ratio).
           CRITICAL FACIAL PRESERVATION:
           - DO NOT modify, enhance, or alter the person's facial features in ANY way
           - Keep the exact face, expression, and natural appearance from the input image
           - Only adjust lighting and composition around the face
           - Maintain 100% original facial structure and features
           COMPOSITION RULES:
           - ALL content MUST be fully contained within the frame
           - Maintain 10% padding from ALL edges
           - NO elements should be cut off or extend beyond the frame
           - Use rule of thirds for main subject placement
           - Text should be large and centered for maximum impact`
        : `Create a vertical YouTube Shorts thumbnail (1080x1920, 9:16 aspect ratio).
           CRITICAL FACIAL PRESERVATION:
           - DO NOT modify, enhance, or alter the person's facial features in ANY way
           - Keep the exact face, expression, and natural appearance from the input image
           - Only adjust lighting and composition around the face
           - Maintain 100% original facial structure and features
           COMPOSITION RULES:
           - ALL content MUST be vertically centered
           - Maintain 15% padding from top AND bottom edges
           - NO elements should extend beyond the vertical frame
           - Text should be positioned in the middle third
           - Subject must be fully visible and properly scaled to fit 9:16
           - Background should extend full height without stretching`;    // Enhanced prompt structure optimized for speed and quality
    const fullPrompt = `
      PROFESSIONAL THUMBNAIL GENERATION:

      **CRITICAL FACIAL PRESERVATION:**
      - Use person's face EXACTLY as provided - zero modifications
      - Only enhance lighting and background, never the face

      **SPECIFICATIONS:**
      - Format: ${aspectRatio === "16:9" ? "1920x1080 YouTube Video" : "1080x1920 YouTube Shorts"}
      - Text: "${finalThumbnailText}" (exact wording, bold and prominent)
      - Video Context: "${topic}" (for styling context only, NOT for text)
      - Style: ${style}

      **COMPOSITION:**
      ${aspectRatioInstructions}

      **ENHANCEMENT FOCUS:**
      - Professional lighting around subject
      - Engaging background
      - Bold, readable typography
      - YouTube-optimized colors

      **CREATIVE DIRECTION:**
      ${creativeDirection}

      **FORBIDDEN:** Face modifications, poor quality elements
    `;
    
    const images: string[] = [];
    const maxRetries = 2; // Reduced from 3 for faster failure handling
    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        console.log(`Generating thumbnail (attempt ${retryCount + 1})...`);
        
        const contents = [{
          role: 'user',
          parts: [
            { text: fullPrompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: 'image/jpeg'
              }
            }
          ]
        }];

        const response = await genAI.models.generateContentStream({
          model: 'gemini-2.5-flash-image-preview',
          config,
          contents
        });

        for await (const chunk of response) {
          if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
            continue;
          }
          
          if (chunk.candidates[0].content.parts[0].inlineData) {
            const inlineData = chunk.candidates[0].content.parts[0].inlineData;
            const base64Data = inlineData.data || '';
            images.push(`data:${inlineData.mimeType || 'image/jpeg'};base64,${base64Data}`);
            console.log('Successfully generated thumbnail');
            success = true;
          }
        }

        if (success) break;

      } catch (error) {
        console.warn(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          console.error('All generation attempts failed');
          throw new Error(`Failed to generate image after ${maxRetries} attempts: ${error}`);
        }
        
        // Reduced exponential backoff delay for faster retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(1.5, retryCount) * 800));
      }
    }

    if (!success) {
      throw new Error('No images were generated successfully');
    }

    return images;
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}

async function getEnhancedPrompts(topic: string, style: string, placement: string, variants: number = 1): Promise<string[]> {
  try {
    // If only 1 variant requested, return a single enhanced prompt
    if (variants === 1) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: `YouTube thumbnail specialist creating photorealistic prompts. Focus on:
          - Professional studio lighting (key, fill, rim positions)
          - Authentic backgrounds (materials, textures, depth)
          - Commercial color grading
          - Natural shadows and perspective
          - Typography matching successful channels
          
          NEVER suggest facial modifications. Keep people completely natural.`
        }, {
          role: "user",
          content: `Photorealistic thumbnail for: ${topic}, Style: ${style}, Placement: ${placement}. 
          Specify: lighting setup, background environment, color grading, typography, composition techniques.`
        }],
        temperature: 0.9, // Increased for faster generation
        max_tokens: 200   // Reduced for speed
      });
      
      return [response.choices[0].message.content || ''];
    }

    // For multiple variants, generate distinct concepts with streamlined prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `Create ${variants} photorealistic thumbnail concepts with variety through lighting and backgrounds. 
        Each variant needs different: lighting setup, background style, text positioning, color scheme.
        Preserve facial authenticity - zero modifications.`
      }, {
        role: "user",
        content: `${variants} concepts for: ${topic}, Style: ${style}, Placement: ${placement}
        Format: concept1 |||VARIANT||| concept2 ${variants > 2 ? '|||VARIANT||| concept3' : ''}`
      }],
      temperature: 1.0, // Maximum creativity for speed
      max_tokens: 600,  // Reduced for faster processing
      presence_penalty: 0.3, // Reduced for speed
      frequency_penalty: 0.2
    });
    
    const content = response.choices[0].message.content || '';
    const prompts = content.split('|||VARIANT|||').map(p => p.trim()).filter(p => p.length > 0);
    
    // Ensure we have exactly the requested number of variants
    if (prompts.length < variants) {
      // If we don't have enough, duplicate and modify the last one
      while (prompts.length < variants) {
        const lastPrompt = prompts[prompts.length - 1];
        prompts.push(`${lastPrompt} (Alternative background and lighting approach)`);
      }
    }
    
    console.log(`Generated ${prompts.length} prompts for ${variants} variants`);
    return prompts.slice(0, variants);
  } catch (error: any) {
    console.error('OpenAI error:', error);
    throw new Error('Failed to enhance prompt with OpenAI: ' + error.message);
  }
}

// Main API route handler
export async function POST(req: NextRequest) {
  console.log('Received generate request');
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const topic = formData.get('topic') as string;
    const style = formData.get('style') as string;
    const placement = formData.get('placement') as string;
    const variantsStr = formData.get('variants') as string | null;
    const thumbnailText = formData.get('thumbnailText') as string | null;
    const variants = variantsStr ? parseInt(variantsStr) : 1;

    console.log('Processing request with:', { topic, style, placement, variants, thumbnailText });

    if (!image || !topic || !style || !placement) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate variants
    if (variants < 1 || variants > 4) {
      return NextResponse.json(
        { error: 'Number of variants must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Convert image to buffer and pre-process for both aspect ratios
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Process for horizontal (16:9)
    const processedBufferHorizontal = await preProcessImage(buffer, "16:9");
    const base64ImageHorizontal = processedBufferHorizontal.toString('base64');
    
    // Process for vertical (9:16)
    const processedBufferVertical = await preProcessImage(buffer, "9:16");
    const base64ImageVertical = processedBufferVertical.toString('base64');
    console.log('Image processed successfully');

    // Get enhanced prompts from OpenAI
    const prompts = await getEnhancedPrompts(topic, style, placement, variants);
    console.log('Enhanced prompts:', prompts);

    try {
      // Generate images with optimized parallel processing for speed
      const horizontalImages: string[] = [];
      const verticalImages: string[] = [];

      // For single variant, process both orientations in parallel
      if (variants === 1) {
        const [hResult, vResult] = await Promise.all([
          generateWithGemini(prompts[0], base64ImageHorizontal, "16:9", topic, style, thumbnailText || undefined),
          generateWithGemini(prompts[0], base64ImageVertical, "9:16", topic, style, thumbnailText || undefined)
        ]);
        horizontalImages.push(...hResult);
        verticalImages.push(...vResult);
      } else {
        // For multiple variants, process sequentially to avoid rate limits
        for (let i = 0; i < prompts.length && i < variants; i++) {
          const prompt = prompts[i];
          try {
            // Generate horizontal version
            const hResult = await generateWithGemini(prompt, base64ImageHorizontal, "16:9", topic, style, thumbnailText || undefined);
            horizontalImages.push(...hResult);

            // Generate vertical version
            const vResult = await generateWithGemini(prompt, base64ImageVertical, "9:16", topic, style, thumbnailText || undefined);
            verticalImages.push(...vResult);
          } catch (error) {
            console.error(`Failed to generate variant ${i + 1}:`, error);
            continue;
          }
        }
      }

      console.log('Generated images successfully');

      // Create ZIP archive with optimized compression
      const archive = archiver('zip', { zlib: { level: 6 } }); // Reduced compression for speed
      const chunks: Buffer[] = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => console.log('Archive created successfully'));

      // Add images to archive
      horizontalImages.forEach((img, i) => {
        const imgBuffer = Buffer.from(img.split(',')[1], 'base64');
        archive.append(imgBuffer, { name: `horizontal-${i + 1}.jpg` });
      });

      verticalImages.forEach((img, i) => {
        const imgBuffer = Buffer.from(img.split(',')[1], 'base64');
        archive.append(imgBuffer, { name: `vertical-${i + 1}.jpg` });
      });

      await archive.finalize();

      // Create downloadable ZIP
      const zipBuffer = Buffer.concat(chunks);
      const zipBase64 = zipBuffer.toString('base64');

      return NextResponse.json({
        images: {
          horizontal: horizontalImages,
          vertical: verticalImages,
          zip: `data:application/zip;base64,${zipBase64}`
        }
      });

    } catch (genError: any) {
      console.error('Gemini generation error:', genError);
      throw new Error('Failed to generate images: ' + genError.message);
    }

  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    );
  }
}
