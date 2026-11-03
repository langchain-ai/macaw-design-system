import { CodeLite } from '../Code/CodeLite';
import { Text } from '../Text';
import type { ChatToolCallModel } from './ChatToolCall.types';
import { formatChatToolCallValue } from './ChatToolCall.value';

function DetailsValue({ value }: { value: unknown }) {
  const preview = formatChatToolCallValue(value);

  if (typeof value === 'string') {
    return (
      <Text
        variant="xs"
        color="tertiary"
        className="max-h-60 overflow-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
      >
        {preview}
      </Text>
    );
  }

  return (
    <div className="max-h-60 max-w-full overflow-auto rounded-md bg-surface-level-2 p-space-2 [overflow-wrap:anywhere]">
      <CodeLite
        value={preview}
        language="json"
        className="text-xxs"
        showGutter={false}
        wrapLines
      />
    </div>
  );
}

function DetailsSection({
  label,
  value,
  emptyLabel,
}: {
  label: string;
  value: unknown;
  emptyLabel: string;
}) {
  return (
    <section aria-label={label} className="flex min-w-0 flex-col gap-space-2">
      <Text variant="xs" weight="medium" color="quaternary">
        {label}
      </Text>
      {value === undefined ? (
        <Text variant="xs" color="tertiary">
          {emptyLabel}
        </Text>
      ) : (
        <DetailsValue value={value} />
      )}
    </section>
  );
}

export function ChatToolCallDetails({
  toolCall,
}: {
  toolCall: ChatToolCallModel;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-space-3">
      <DetailsSection
        label="Request"
        value={toolCall.args}
        emptyLabel="No arguments"
      />
      <DetailsSection
        label="Response"
        value={toolCall.result}
        emptyLabel={
          toolCall.status === 'pending' || toolCall.status === 'running'
            ? 'Awaiting response'
            : 'No response provided'
        }
      />
      {toolCall.error !== undefined && (
        <DetailsSection
          label="Error"
          value={toolCall.error}
          emptyLabel="No error details"
        />
      )}
    </div>
  );
}
