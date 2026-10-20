import { config } from '../config/ai.js';

class AIService {
  constructor() {
    this.baseUrl = config.ai.baseUrl.replace(/\/$/, '');
    this.apiKey = config.ai.apiKey;
    this.model = config.ai.model;
  }

  /**
   * Mengirim request ke 9router / Ollama OpenAI-compatible endpoint dengan streaming
   * @param {Array} messages - Array of {role, content}
   * @param {Function} onChunk - Callback(chunkText)
   * @returns {Promise<string>} - Full response text
   */
  async streamChat(messages, onChunk) {
    const url = `${this.baseUrl}/chat/completions`;
    
    const payload = {
      model: this.model,
      messages: messages,
      stream: true,
      temperature: 0.3,
    };

    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API Error (${response.status}): ${errText}`);
    }

    let fullContent = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') {
          break;
        }

        try {
          const json = JSON.parse(dataStr);
          const delta = json.choices?.[0]?.delta;
          if (delta?.content) {
            fullContent += delta.content;
            if (onChunk) {
              onChunk(delta.content);
            }
          }
        } catch (e) {
          // Abaikan chunk non-JSON
        }
      }
    }

    return fullContent;
  }

  async chat(messages) {
    let full = '';
    await this.streamChat(messages, (chunk) => {
      full += chunk;
    });
    return full;
  }
}

export const aiService = new AIService();
