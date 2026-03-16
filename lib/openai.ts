import OpenAI from 'openai';
import type { BrandProfile, PostFormat, PostTone, PostLength, PostHookStyle } from '@/types/database';

// Lazy singleton — avoids initialization errors at build time when env vars are absent
let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

/** @deprecated use getOpenAI() instead */
export const openai = {
  get chat() {
    return getOpenAI().chat;
  },
};

export function buildSystemPrompt(profile: BrandProfile | null): string {
  if (!profile) {
    return `You are a LinkedIn content expert. Write professional, engaging LinkedIn posts. 
Return a JSON object with a "variations" array of 3 post variations, each with id, content, char_count, hook_type, and hashtags fields.
Also include "voice_match_score" (0-1) and "meta" with tokens_used and model fields.`;
  }

  return `You are a LinkedIn content expert writing in the voice of a specific person.

Voice Profile:
- Product: ${profile.product_name} — ${profile.product_description}
- Audience: ${profile.primary_audience}
- Tone score: ${profile.tone_score}/5 (1=very formal, 5=very casual)
- Sentence length: ${profile.avg_sentence_length}
- Emoji usage: ${profile.emoji_usage}
- CTA style: ${profile.cta_style}
- Signature phrases: ${profile.signature_phrases?.join(', ') || 'none'}
- Phrases to avoid: ${profile.avoid_phrases?.join(', ') || 'none'}
- Brand voice keywords: ${profile.brand_voice_keywords?.join(', ') || 'none'}

Return a JSON object with:
{
  "variations": [
    {
      "id": 1,
      "content": "Full LinkedIn post text...",
      "char_count": 287,
      "hook_type": "personal_story",
      "hashtags": ["#B2BSaaS", "#ProductLed"]
    },
    { ...variation 2... },
    { ...variation 3... }
  ],
  "voice_match_score": 0.87,
  "meta": { "tokens_used": 412, "model": "gpt-4o" }
}`;
}

export function buildUserPrompt(
  postFormat: PostFormat,
  topicText: string,
  tone: PostTone,
  length: PostLength,
  hookStyle?: PostHookStyle
): string {
  const lengthGuide: Record<PostLength, string> = {
    short: 'under 150 words',
    medium: '150–300 words',
    long: '300–500 words',
    thread: '5–7 short posts in a thread format (separate with "---")',
  };

  return `Generate 3 LinkedIn post variations about the following topic.

Format: ${postFormat}
Topic: ${topicText}
Tone: ${tone}
Length: ${lengthGuide[length]}
${hookStyle ? `Hook style: ${hookStyle}` : ''}

Each variation should have a different angle or hook while staying on the same topic.
Make them feel authentic, not generic AI content. Avoid filler phrases.`;
}

export async function analyseVoiceProfile(samplePosts: string): Promise<Partial<BrandProfile>> {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Analyse the provided LinkedIn posts and extract the author's writing style. 
Return a JSON object with:
{
  "tone_score": <1-5 integer>,
  "avg_sentence_length": "short|medium|long",
  "emoji_usage": "none|minimal|moderate|heavy",
  "hook_style_preferences": ["array", "of", "hook", "types"],
  "signature_phrases": ["characteristic", "phrases"],
  "brand_voice_keywords": ["adjectives", "describing", "voice"]
}`,
      },
      {
        role: 'user',
        content: `Analyse these LinkedIn posts:\n\n${samplePosts}`,
      },
    ],
    max_tokens: 1000,
  });

  return JSON.parse(completion.choices[0].message.content!);
}
