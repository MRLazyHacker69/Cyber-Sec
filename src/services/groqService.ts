import Groq from "groq-sdk";

// --- API KEY CONFIGURATION ---
// Paste your Groq API Key inside the quotes below:
// আপনার Groq API Key নিচের কোটেশনের (" ") ভেতরে বসান:
const GROQ_API_KEY = "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"; 

let currentApiKey = (GROQ_API_KEY !== "YOUR_GROQ_API_KEY_HERE" ? GROQ_API_KEY : "") || (import.meta as any).env?.VITE_GROQ_API_KEY || "";

export function updateServiceApiKey(newKey: string) {
  currentApiKey = newKey;
}

export interface VideoMetadata {
  titles: {
    seo: string;
    ctr: string;
    warning: string;
  };
  description: {
    hook: string;
    about: string;
    disclaimer: string;
    timestamps: string;
  };
  tags: string[];
  thumbnail: {
    concept: string;
    aiPrompt: string;
  };
  engagement: {
    pinnedComment: string;
    socialCaption: string;
  };
}

export async function generateVideoMetadata(topic: string): Promise<VideoMetadata> {
  if (!currentApiKey) {
    throw new Error('API_KEY_MISSING');
  }

  try {
    const groq = new Groq({ 
      apiKey: currentApiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });

    const systemInstruction = `
      You are an expert YouTube SEO Strategist and Cyber Security Content Creator. 
      Your task is to generate complete video metadata for a channel focusing on "Cyber Security, Social Media Security, and Ethical Hacking".
      The creator is a Class 12 student and a Muslim content creator who uploads educational videos to help people stay safe online.
      
      Language: Use a mix of Bengali and English (Benglish style).
      Tone: Authoritative, helpful, and ethical.
      
      Requirements:
      1. 3 Viral Titles (SEO, CTR, Warning).
      2. Full Description (Hook, About, Disclaimer, Timestamps).
      3. 20+ High-Rank Tags.
      4. Thumbnail Concept & AI Prompt.
      5. Engagement Strategy (Pinned comment, social caption).
      
      IMPORTANT: You MUST return the response in strict JSON format.
      JSON Structure:
      {
        "titles": { "seo": "", "ctr": "", "warning": "" },
        "description": { "hook": "", "about": "", "disclaimer": "", "timestamps": "" },
        "tags": ["tag1", "tag2", ...],
        "thumbnail": { "concept": "", "aiPrompt": "" },
        "engagement": { "pinnedComment": "", "socialCaption": "" }
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Generate YouTube metadata for the topic: ${topic}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const text = chatCompletion.choices[0]?.message?.content;
    if (!text) throw new Error('AI returned an empty response. Please try a different topic.');
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Groq API Error:', error);
    
    const errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('401')) {
      throw new Error('API_KEY_INVALID');
    }

    throw new Error(`Groq API Error: ${errorMessage}`);
  }
}
