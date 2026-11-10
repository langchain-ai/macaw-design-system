/**
 * Reads LangChain messages structurally, whether they are `@langchain/core`
 * class instances (`@langchain/react` 1.x) or plain objects (0.3.x and
 * server payloads), without importing either package.
 */

export type MessageKind = 'human' | 'ai' | 'tool' | 'system' | 'other';

export interface MessageToolCall {
  id: string;
  name: string;
  args: unknown;
}

export interface NormalizedMessage {
  id: string;
  kind: MessageKind;
  text: string;
  reasoning: string;
  images: string[];
  toolCalls: MessageToolCall[];
  /** Tool results only. */
  toolCallId?: string;
  toolStatus?: 'success' | 'error';
  raw: unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function messageKind(message: Record<string, unknown>): MessageKind {
  let type = readString(message.type) ?? readString(message.role);
  if (!type && typeof message._getType === 'function') {
    type = readString((message._getType as () => unknown)());
  }
  switch (type) {
    case 'human':
    case 'user':
      return 'human';
    case 'ai':
    case 'assistant':
      return 'ai';
    case 'tool':
      return 'tool';
    case 'system':
    case 'developer':
      return 'system';
    default:
      return 'other';
  }
}

function parseArgs(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    // Arguments still streaming in are not valid JSON yet.
    return value;
  }
}

function imageUrl(block: Record<string, unknown>) {
  const imageUrlField = block.image_url;
  if (typeof imageUrlField === 'string') return imageUrlField;
  if (isRecord(imageUrlField)) return readString(imageUrlField.url);
  const url = readString(block.url);
  if (url) return url;
  const data =
    readString(block.data) ??
    readString(block.base64) ??
    (isRecord(block.source) ? readString(block.source.data) : undefined);
  const mimeType =
    readString(block.mimeType) ??
    readString(block.mime_type) ??
    (isRecord(block.source) ? readString(block.source.media_type) : undefined);
  return data ? `data:${mimeType ?? 'image/png'};base64,${data}` : undefined;
}

function reasoningFromKwargs(message: Record<string, unknown>) {
  const kwargs = message.additional_kwargs;
  if (!isRecord(kwargs)) return '';
  const content = readString(kwargs.reasoning_content);
  if (content) return content;
  const reasoning = kwargs.reasoning;
  if (isRecord(reasoning) && Array.isArray(reasoning.summary)) {
    return reasoning.summary
      .map((part) => (isRecord(part) ? (readString(part.text) ?? '') : ''))
      .filter(Boolean)
      .join('\n\n');
  }
  return '';
}

function contentBlocks(
  message: Record<string, unknown>
): unknown[] | undefined {
  // Prefer the standard blocks a core message instance derives across
  // providers; fall back to the raw content of plain objects.
  try {
    const standard = message.contentBlocks;
    if (Array.isArray(standard)) return standard;
  } catch {
    // A message that cannot derive standard blocks still has raw content.
  }
  return Array.isArray(message.content) ? message.content : undefined;
}

/**
 * Normalizes one message. Tool calls without IDs get IDs derived from the
 * message ID and position, so they stay stable across renders.
 */
export function normalizeMessage(
  value: unknown,
  index: number
): NormalizedMessage {
  const message = isRecord(value) ? value : {};
  const id = readString(message.id) ?? `message-${index}`;
  const kind = messageKind(message);
  const textParts: string[] = [];
  const reasoningParts: string[] = [];
  const images: string[] = [];
  const blockToolCalls: MessageToolCall[] = [];

  if (typeof message.content === 'string') textParts.push(message.content);
  const blocks = contentBlocks(message);
  for (const block of blocks ?? []) {
    if (typeof block === 'string') {
      textParts.push(block);
      continue;
    }
    if (!isRecord(block)) continue;
    switch (block.type) {
      case 'text':
        if (typeof message.content !== 'string') {
          textParts.push(readString(block.text) ?? '');
        }
        break;
      case 'reasoning':
        reasoningParts.push(readString(block.reasoning) ?? '');
        break;
      case 'thinking':
        reasoningParts.push(readString(block.thinking) ?? '');
        break;
      case 'image':
      case 'image_url': {
        const url = imageUrl(block);
        if (url) images.push(url);
        break;
      }
      case 'tool_use':
      case 'tool_call': {
        const name = readString(block.name);
        if (name) {
          blockToolCalls.push({
            id: readString(block.id) ?? '',
            name,
            args: parseArgs(block.input ?? block.args),
          });
        }
        break;
      }
      default:
        break;
    }
  }

  let toolCalls: MessageToolCall[] = [];
  const rawToolCalls = Array.isArray(message.tool_calls)
    ? message.tool_calls
    : Array.isArray(message.tool_call_chunks)
      ? message.tool_call_chunks
      : undefined;
  if (rawToolCalls?.length) {
    toolCalls = rawToolCalls.flatMap((call) => {
      if (!isRecord(call)) return [];
      const name = readString(call.name);
      if (!name) return [];
      return [
        { id: readString(call.id) ?? '', name, args: parseArgs(call.args) },
      ];
    });
  } else {
    toolCalls = blockToolCalls;
  }
  toolCalls = toolCalls.map((call, position) => ({
    ...call,
    id: call.id || `${id}:tool:${position}`,
  }));

  const status = readString(message.status);
  return {
    id,
    kind,
    text: textParts.join(''),
    reasoning:
      reasoningParts.filter(Boolean).join('\n\n') ||
      reasoningFromKwargs(message),
    images,
    toolCalls,
    toolCallId: readString(message.tool_call_id),
    toolStatus:
      status === 'error' ? 'error' : kind === 'tool' ? 'success' : undefined,
    raw: value,
  };
}
