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
        content: `You are a professional thumbnail designer for top YouTube creators. Provide specific, actionable creative direction focusing on:

        REALISM PRIORITIES:
        1. Authentic lighting setups (3-point lighting, natural window light, etc.)
        2. Realistic background environments that enhance credibility
        3. Professional color grading techniques
        4. Depth and dimension through layering
        5. Typography that matches successful YouTube channels

        TECHNICAL FOCUS:
        - Specify exact lighting angles and intensities
        - Detail background elements and textures
        - Define color palettes with hex codes when relevant
        - Suggest realistic shadow placements
        - Recommend composition techniques used by top creators

        FORBIDDEN: Any suggestions for facial modifications, beauty enhancements, or unrealistic effects.`
      },
      {
        role: "user",
        content: `Create detailed creative direction for: "${topic}"
        Style: ${style}
        
        Provide specific guidance on:
        1. Lighting setup (direction, intensity, color temperature)
        2. Background design (textures, elements, depth)
        3. Color palette (primary, secondary, accent colors)
        4. Typography treatment (size, positioning, effects)
        5. Compositional elements that drive engagement
        
        Focus on photorealistic, professional results that look like they were shot in a real studio.`
      }
    ],
    temperature: 0.7, // Balanced for speed and quality
    max_tokens: 200   // Reduced for faster response   
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
    // Optimized configuration balancing realism with speed
    const config = {
      temperature: 0.6, // Balanced for quality and speed
      topP: 0.8, // Optimal balance for diverse but focused outputs
      topK: 10, // Good balance between quality and speed
      maxOutputTokens: 2048,
      candidateCount: 1,
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
      PROFESSIONAL THUMBNAIL GENERATION:

      **FACIAL PRESERVATION (CRITICAL):**
      - Use person's face EXACTLY as provided - zero modifications
      - Preserve natural skin, expressions, and all facial features
      - Only enhance lighting and background, never the face

      **SPECIFICATIONS:**
      - Format: ${aspectRatio === "16:9" ? "1920x1080 YouTube Video" : "1080x1920 YouTube Shorts"}
      - Text: "${topic}" (exact wording, high readability)
      - Style: ${style}
      - Quality: Professional, broadcast-ready

      **COMPOSITION:**
      ${aspectRatioInstructions}

      **ENHANCEMENT FOCUS:**
      - Professional lighting setup around subject
      - Engaging background that complements subject
      - Bold, readable typography with proper contrast
      - YouTube-optimized colors for engagement

      **CREATIVE DIRECTION:**
      ${creativeDirection}

      **FORBIDDEN:**
      - Face modifications, beauty filters, or enhancements
      - Poor quality, blurry, or pixelated elements
      - Illegible text or cut-off elements
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
          content: `You are a YouTube thumbnail specialist creating photorealistic thumbnail prompts. Focus on:
          
          REALISM PRIORITIES:
          - Professional studio lighting setups with specific technical details
          - Authentic background environments with realistic textures and materials
          - Commercial-grade color grading techniques
          - Natural depth of field and shadow placement
          - Typography treatments matching successful YouTube channels
          
          TECHNICAL SPECIFICATIONS:
          - Lighting: Specify angles (key light, fill light, rim light positions)
          - Backgrounds: Detail materials (brushed metal, wood grain, tech setups, etc.)
          - Colors: Professional color temperature and grading techniques
          - Shadows: Natural shadow direction and intensity
          - Perspective: Professional camera angles and composition
          
          STRICT RULE: Never suggest facial modifications or artificial enhancements.
          The person must appear completely natural and authentic.`
        }, {
          role: "user",
          content: `Create a photorealistic thumbnail concept for:
            Description: ${topic}
            Style: ${style}
            Person placement: ${placement}
            
            Provide detailed technical specifications:
            1. Studio lighting setup (key light at 45°, fill light intensity, rim lighting)
            2. Background environment (specific materials, textures, depth layers)
            3. Professional color grading (temperature, saturation, contrast levels)
            4. Typography design (font weight, drop shadows, positioning)
            5. Composition techniques for maximum viewer engagement
            
            Result should look like a professional photography studio shoot.`
        }],
        temperature: 0.8, // Higher for faster, more creative responses
        max_tokens: 300   // Reduced for speed
      });
      
      return [response.choices[0].message.content || ''];
    }

    // For multiple variants, generate distinct concepts
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are a YouTube thumbnail expert creating ${variants} photorealistic design concepts.
        
        REALISM STANDARDS:
        - Each variant must look like professional studio photography
        - Preserve facial authenticity with zero artificial modifications
        - Create variety through technical lighting and environmental changes
        - Maintain broadcast-quality visual standards
        
        TECHNICAL VARIATION APPROACHES:
        1. Lighting Setups: Different professional lighting configurations
           - Variant 1: Dramatic key lighting with strong shadows
           - Variant 2: Soft box lighting with even illumination
           
        2. Background Environments: Distinct realistic settings
           - Modern studio setup vs. natural environment vs. tech workspace
           
        3. Color Grading: Professional post-production techniques
           - Warm vs. cool color temperatures
           - High contrast vs. natural saturation
           
        4. Composition Styles: Different professional framing approaches
           - Close-up portrait vs. wider environmental shot
           
        FORBIDDEN: Facial modifications, beauty filters, unrealistic enhancements.`
      }, {
        role: "user",
        content: `Create ${variants} photorealistic thumbnail concepts for:
          Description: ${topic}
          Style: ${style}
          Person placement: ${placement}
          
          Each variant needs:
          - Unique background approach
          - Different lighting environment 
          - Varied text positioning
          - Distinct color scheme
          - Natural, unmodified person appearance
          
          Format: concept1 |||VARIANT||| concept2 ${variants > 2 ? '|||VARIANT||| concept3' : ''}`
      }],
      temperature: 0.9, // High creativity for diverse variants
      max_tokens: 800,  // Reduced for faster processing
      presence_penalty: 0.6, // Reduced for speed
      frequency_penalty: 0.4
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
