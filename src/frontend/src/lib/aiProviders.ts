// AI+ provider layer — designed so a new Cloud AI provider (OpenAI, Google,
// etc.) can be added later by implementing the same AiProvider interface
// and registering it below. Admin picks which provider is active; nothing
// else in the app needs to change when a new one is added.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ImageInput {
  data: string;
  mediaType: string;
}

export interface AiProvider {
  id: string;
  name: string;
  /** Streams the response, calling onChunk as text arrives. */
  streamChat: (
    messages: ChatMessage[],
    apiKey: string,
    onChunk: (delta: string) => void,
    image?: ImageInput,
  ) => Promise<void>;
}

const SYSTEM_PROMPT =
  "You are an expert math and science tutor inside a calculator app, covering everything from school level through engineering level. Give clear, detailed, step-by-step explanations — show your reasoning, not just the final answer. Use markdown: **bold** for emphasis, `code` for expressions, and numbered steps where helpful. Be thorough but well-organized so the explanation is easy to follow when read or heard aloud. If shown a photo, first transcribe the problem you see, then solve it.";

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < attempts) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastError;
}

const anthropicProvider: AiProvider = {
  id: "anthropic",
  name: "Claude (Anthropic)",
  streamChat: async (messages, apiKey, onChunk, image) => {
    await withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45_000);

      const lastUserContent: Array<Record<string, unknown>> = [];
      if (image) {
        lastUserContent.push({
          type: "image",
          source: { type: "base64", media_type: image.mediaType, data: image.data },
        });
      }
      const apiMessages = messages.map((m, idx) => {
        if (idx === messages.length - 1 && m.role === "user" && image) {
          return {
            role: m.role,
            content: [...lastUserContent, { type: "text", text: m.content }],
          };
        }
        return { role: m.role, content: m.content };
      });

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-5",
            max_tokens: 1536,
            system: SYSTEM_PROMPT,
            stream: true,
            messages: apiMessages,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error?.message || `Request failed (${response.status})`);
        }
        if (!response.body) throw new Error("No response stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") continue;
            try {
              const event = JSON.parse(payload);
              if (
                event.type === "content_block_delta" &&
                event.delta?.type === "text_delta"
              ) {
                onChunk(event.delta.text);
              }
            } catch {
              /* ignore malformed SSE chunk */
            }
          }
        }
      } finally {
        clearTimeout(timeout);
      }
    });
  },
};

export const AI_PROVIDERS: Record<string, AiProvider> = {
  anthropic: anthropicProvider,
  // Future: openai: openaiProvider, google: googleProvider — same interface.
};

export const DEFAULT_PROVIDER = "anthropic";
