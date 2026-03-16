import OpenAI from 'openai';
import type { BrandProfile } from '@/types/database';

function getOpenAI() {
  return new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  });
}

export function buildVoiceProfileContext(profile: BrandProfile | null): string {
  if (!profile) return '';

  return `
VOICE PROFILE:
- Product: ${profile.product_name || 'Not specified'}
- Audience: ${profile.primary_audience || 'Not specified'}
- Tone (1=formal, 5=casual): ${profile.tone_score || 3}/5
- Sentence length: ${profile.avg_sentence_length || 'medium'}
- Emoji usage: ${profile.emoji_usage || 'minimal'}
- Preferred hooks: ${(profile.hook_style_preferences || []).join(', ') || 'varied'}
- Signature phrases: ${(profile.signature_phrases || []).join(', ') || 'none'}
- Avoid phrases: ${(profile.avoid_phrases || []).join(', ') || 'none'}
- CTA style: ${profile.cta_style || 'soft'}
- Voice keywords: ${(profile.brand_voice_keywords || []).join(', ') || 'professional'}
`.trim();
}

export interface GeneratePostsParams {
  topic: string;
  format: string;
  tone: string;
  length: string;
  hookStyle?: string;
  sourceContent?: string;
  voiceProfile?: BrandProfile | null;
}

export async function generatePosts(params: GeneratePostsParams) {
  const voiceContext = buildVoiceProfileContext(params.voiceProfile || null);

  const lengthGuide =
    {
      short: 'under 150 words',
      medium: '150–300 words',
      long: '300–500 words',
      thread: '5–7 connected posts, each 100–200 words',
    }[params.length] || '150–300 words';

  const systemPrompt = `You are an expert LinkedIn content writer. You create authentic, engaging LinkedIn posts that drive real business results.

${voiceContext}

Always respond with valid JSON matching this exact schema:
{
  "variations": [
    {
      "id": 1,
      "content": "Full LinkedIn post text...",
      "char_count": 287,
      "hook_type": "personal_story",
      "hashtags": ["#B2BSaaS", "#ProductLed"]
    },
    { "id": 2, ... },
    { "id": 3, ... }
  ],
  "voice_match_score": 0.87,
  "meta": { "tokens_used": 412, "model": "gpt-4o" }
}`;

  const userPrompt = `Write 3 LinkedIn post variations about: ${params.topic}

Format: ${params.format}
Tone: ${params.tone}
Length: ${lengthGuide}
Hook style: ${params.hookStyle || 'varied'}
${params.sourceContent ? `Source content to draw from:\n${params.sourceContent}` : ''}

Each variation must be distinctly different in approach. Make them authentic and specific — avoid generic AI-sounding phrases.`;

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse OpenAI response as JSON');
  }
}

export async function analyzeVoiceProfile(samplePosts: string) {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Analyze the provided LinkedIn posts and extract a voice profile. Return JSON matching:
{
  "tone_score": 1-5,
  "avg_sentence_length": "short|medium|long",
  "emoji_usage": "none|minimal|moderate|heavy",
  "hook_style_preferences": ["array", "of", "styles"],
  "signature_phrases": ["up to 10 characteristic phrases"],
  "brand_voice_keywords": ["up to 10 adjectives"],
  "cta_style": "soft|direct|question"
}`,
      },
      {
        role: 'user',
        content: `Analyze these LinkedIn posts:\n\n${samplePosts}`,
      },
    ],
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse voice analysis response');
  }
}
