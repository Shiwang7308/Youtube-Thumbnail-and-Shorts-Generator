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
  // Calculate target dimensions based on aspect ratio
  let width: number, height: number;
  const MAX_DIMENSION = 1024;

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
    .jpeg({ quality: 95, mozjpeg: true })
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

async function getCreativeDirection(topic: string, style: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert Art Director specializing in YouTube thumbnails. Create a detailed visual direction for a programming course thumbnail."
      },
      {
        role: "user",
        content: `Create a thumbnail concept for "${topic}" with ${style}. Make it engaging and professional.`
      }
    ],
    temperature: 0.7,
    max_tokens: 300   
  });

  return response.choices[0]?.message?.content || '';
}


async function generateWithGemini(
  prompt: string,
  imageBase64: string,
  aspectRatio: "16:9" | "9:16",
  topic: string,
  style: string
): Promise<string[]> {
  try {
    // Optimized configuration for faster and more consistent generation
    const config = {
      temperature: 0.8,
      topP: 0.8, 
      topK: 15, 
      maxOutputTokens: 2048, 
      candidateCount: 1, // Generate only one candidate for faster response
      responseModalities: ['IMAGE', 'TEXT']
    };

    // Get creative direction from GPT-4
    const creativeDirection = await getCreativeDirection(topic, style);
    console.log('Creative direction generated');

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
           - Background should extend full height without stretching`;    // Enhanced prompt structure based on testing
    const fullPrompt = `
      --- ART DIRECTION BRIEF ---
      **Objective:** Create a viral, professional, and click-worthy YouTube thumbnail.

      **CRITICAL FACIAL PRESERVATION REQUIREMENTS:**
      - ABSOLUTELY DO NOT modify, enhance, beautify, or alter the person's face in ANY way
      - Keep 100% original facial features, expressions, skin texture, and appearance
      - The face must remain exactly as shown in the input image
      - Only enhance lighting and background elements around the person

      **Core Request:**
      - **Style Direction:** ${style}
      - **Image Integration:** Use the user-provided photo as the central subject with ZERO facial modifications
      - **Text Content:** Overlay the exact text: "${topic}"

      **Technical & Design Specifications:**
      - **Composition:** ${aspectRatioInstructions}. Use the rule of thirds for a balanced and professional layout.
      - **Lighting:** Employ cinematic, dramatic lighting around the subject. DO NOT modify the face itself.
      - **Color Palette:** Use a vibrant, high-contrast color palette that is harmonious with the subject's photo.
      - **Text Readability:** This is CRITICAL. The text must be perfectly legible on all screen sizes, from mobile phones to TVs. Apply a semi-transparent dark gradient behind the text for maximum contrast. Ensure a minimum 10% safety margin for the text from all edges.
      - **Output Quality:** Render in 8K resolution, photorealistic, sharp focus, high detail, professional studio quality.

      **--- NEGATIVE PROMPTS (AVOID AT ALL COSTS) ---**
      - DO NOT include: Face modifications, facial enhancements, beauty filters, face smoothing, face alterations
      - DO NOT include: Blurry or low-resolution elements, text errors, bad typography, watermarks, signatures, or any artifacts.

      ${creativeDirection}
    `;
    
    const images: string[] = [];
    const maxRetries = 3;
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
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
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
          content: `You are an expert thumbnail designer. Create a single, high-impact YouTube thumbnail prompt.
          CRITICAL: Keep the exact topic text "${topic}" and never modify it.
          Focus on professional composition and maximum engagement.`
        }, {
          role: "user",
          content: `Create a single thumbnail concept for:
            Topic: ${topic}
            Style: ${style}
            Person placement: ${placement}
            
            Include specific lighting, composition, and design details for a professional result.`
        }],
        temperature: 0.7,
        max_tokens: 400
      });
      
      return [response.choices[0].message.content || ''];
    }

    // For multiple variants, generate distinct concepts
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are an expert thumbnail designer. Generate EXACTLY ${variants} distinct thumbnail concepts.
        CRITICAL REQUIREMENTS:
        - Keep the exact topic text "${topic}" - never modify it
        - Each concept must be visually different
        - Maintain natural facial features - DO NOT alter the person's face
        - Focus on lighting, composition, and background variations
        
        Return each concept separated by "|||VARIANT|||"`
      }, {
        role: "user",
        content: `Create ${variants} distinct thumbnail concepts:
          Topic: ${topic}
          Style: ${style}
          Person placement: ${placement}
          
          Each variant should have:
          - Different lighting approach (dramatic, soft, cinematic, etc.)
          - Different background treatment
          - Different text positioning
          - Unique visual elements
          
          Format: concept1 |||VARIANT||| concept2 ${variants > 2 ? '|||VARIANT||| concept3' : ''}`
      }],
      temperature: 0.9,
      max_tokens: 1200,
      presence_penalty: 0.8,
      frequency_penalty: 0.6
    });
    
    const content = response.choices[0].message.content || '';
    const prompts = content.split('|||VARIANT|||').map(p => p.trim()).filter(p => p.length > 0);
    
    // Ensure we have exactly the requested number of variants
    if (prompts.length < variants) {
      // If we don't have enough, duplicate and modify the last one
      while (prompts.length < variants) {
        const lastPrompt = prompts[prompts.length - 1];
        prompts.push(`${lastPrompt} (Alternative lighting and composition)`);
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
    const variants = variantsStr ? parseInt(variantsStr) : 1;

    console.log('Processing request with:', { topic, style, placement, variants });

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
      // Generate one image at a time to prevent timeouts and excessive resource usage
      const horizontalImages: string[] = [];
      const verticalImages: string[] = [];

      // Process prompts sequentially
      for (let i = 0; i < prompts.length && i < variants; i++) {
        const prompt = prompts[i];
        try {
          // Generate horizontal version
          const hResult = await generateWithGemini(prompt, base64ImageHorizontal, "16:9", topic, style);
          horizontalImages.push(...hResult);

          // Generate vertical version
          const vResult = await generateWithGemini(prompt, base64ImageVertical, "9:16", topic, style);
          verticalImages.push(...vResult);
        } catch (error) {
          console.error(`Failed to generate variant ${i + 1}:`, error);
          // Continue with next variant if one fails
          continue;
        }
      }

      console.log('Generated images successfully');

      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });
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
