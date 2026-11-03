import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';

import { IconButton } from '../IconButton';
import { Text } from '../Text';

export function ChatRichContentQuestionNav({
  title,
  current,
  total,
  disabled,
  onChange,
}: {
  title: string;
  current: number;
  total: number;
  disabled: boolean;
  onChange: (current: number) => void;
}) {
  return (
    <nav
      aria-label={`Questions: ${title}`}
      className="flex shrink-0 items-center gap-space-1"
    >
      <IconButton
        type="button"
        icon={CaretLeftIcon}
        iconWeight="regular"
        size="xxs"
        color="secondary"
        variant="plain"
        label="Previous question"
        disabled={disabled || current <= 1}
        onClick={() => onChange(current - 1)}
      />
      <Text
        as="span"
        variant="xs"
        color="tertiary"
        aria-live="polite"
        aria-atomic="true"
        className="whitespace-nowrap tabular-nums"
      >
        {current} of {total}
      </Text>
      <IconButton
        type="button"
        icon={CaretRightIcon}
        iconWeight="regular"
        size="xxs"
        color="secondary"
        variant="plain"
        label="Next question"
        disabled={disabled || current >= total}
        onClick={() => onChange(current + 1)}
      />
    </nav>
  );
}
