import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai?: OpenAI;

  constructor(private configService: ConfigService) 
  {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      console.log('[AiService] Found OpenAI API Key, AI enabled.');
      this.openai = new OpenAI({ apiKey });
    } else {
      console.log('[AiService] No API Key found, AI disabled. Using fallback.');
    }
  }

  async generate(prompt: string): Promise<string> {
    if (!this.openai) {
      console.log('[AiService] AI generate called, but AI is disabled.');
      throw new Error('AI disabled (missing API key)');
    }

    console.log('[AiService] Sending prompt to OpenAI:', prompt);

    const response = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a release notes generator. Return STRICT JSON only. No explanations.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    console.log('[AiService] OpenAI response received.');
    return response.choices[0].message.content ?? '';
  }
}
