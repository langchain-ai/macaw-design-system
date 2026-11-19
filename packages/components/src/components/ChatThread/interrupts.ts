import type {
  ChatThreadActionRequest,
  ChatThreadDecision,
  ChatThreadDecisionType,
  ChatThreadInterrupt,
} from './ChatThread.types';
import { isRecord } from './messages';

const DECISIONS = new Set<ChatThreadDecisionType>([
  'approve',
  'edit',
  'reject',
  'respond',
]);

function decisionsFrom(value: unknown): ChatThreadDecisionType[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const decisions = value.filter((item): item is ChatThreadDecisionType =>
    DECISIONS.has(item as ChatThreadDecisionType)
  );
  return decisions.length ? decisions : undefined;
}

/**
 * Reads one interrupt. Human-in-the-loop middleware requests become
 * `approval` interrupts in either casing: Python graphs send
 * `action_requests` and `review_configs`, JavaScript graphs `actionRequests`
 * and `reviewConfigs`. Anything else is `other`.
 */
export function parseInterrupt(
  raw: unknown,
  index: number
): ChatThreadInterrupt {
  const record = isRecord(raw) ? raw : {};
  const id =
    typeof record.id === 'string' && record.id
      ? record.id
      : `interrupt-${index}`;
  const value = 'value' in record ? record.value : raw;
  if (isRecord(value)) {
    const snake = Array.isArray(value.action_requests);
    const camel = Array.isArray(value.actionRequests);
    if (snake || camel) {
      const requests = (
        snake ? value.action_requests : value.actionRequests
      ) as unknown[];
      const configs = (snake ? value.review_configs : value.reviewConfigs) as
        | unknown[]
        | undefined;
      const allowedByName = new Map<string, ChatThreadDecisionType[]>();
      for (const config of configs ?? []) {
        if (!isRecord(config)) continue;
        const name = snake ? config.action_name : config.actionName;
        const allowed = decisionsFrom(
          snake ? config.allowed_decisions : config.allowedDecisions
        );
        if (typeof name === 'string' && allowed)
          allowedByName.set(name, allowed);
      }
      return {
        kind: 'approval',
        id,
        casing: snake ? 'snake' : 'camel',
        raw,
        requests: requests.flatMap((request): ChatThreadActionRequest[] => {
          if (!isRecord(request) || typeof request.name !== 'string') return [];
          return [
            {
              name: request.name,
              args: isRecord(request.args) ? request.args : {},
              description:
                typeof request.description === 'string'
                  ? request.description
                  : undefined,
              // Without a config, offer the decisions every request accepts.
              allowedDecisions: allowedByName.get(request.name) ?? [
                'approve',
                'reject',
              ],
            },
          ];
        }),
      };
    }
  }
  return { kind: 'other', id, value, raw };
}

/**
 * Builds the resume payload for a human-in-the-loop request, one decision
 * per action in order, in the casing the graph sent.
 */
export function toHumanInTheLoopResponse(
  interrupt: Extract<ChatThreadInterrupt, { kind: 'approval' }>,
  decisions: readonly ChatThreadDecision[]
) {
  return {
    decisions: decisions.map((decision, index) => {
      switch (decision.type) {
        case 'edit': {
          const action = {
            name: interrupt.requests[index]?.name ?? '',
            args: decision.args,
          };
          return interrupt.casing === 'snake'
            ? { type: 'edit', edited_action: action }
            : { type: 'edit', editedAction: action };
        }
        case 'reject':
          return decision.message
            ? { type: 'reject', message: decision.message }
            : { type: 'reject' };
        case 'respond':
          return { type: 'respond', message: decision.message };
        default:
          return { type: 'approve' };
      }
    }),
  };
}
