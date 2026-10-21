import { describe, expect, it } from 'vitest';

import { screen } from '@testing-library/react';

import { render as lsRender } from '../../../test-utils';
import { CopyButton, CopyIconButton } from '../CopyButton';

describe('CopyIconButton', () => {
  it('uses string copy text as the accessible label', () => {
    lsRender(<CopyIconButton copy="run-id" copyText="Copy run ID" />);

    expect(
      screen.getByRole('button', { name: 'Copy run ID' })
    ).toBeInTheDocument();
  });

  it('supports a separate accessible label for rich tooltip content', () => {
    lsRender(
      <CopyIconButton
        copy="serialized-filter"
        copyText={<>Copy this value into the API or SDK</>}
        label="Copy filters"
      />
    );

    expect(
      screen.getByRole('button', { name: 'Copy filters' })
    ).toBeInTheDocument();
  });

  it('forwards data attributes to the button', () => {
    lsRender(
      <CopyIconButton
        copy="run-id"
        copyText="Copy run ID"
        data-analytics-id="copy-icon-button"
      />
    );

    expect(screen.getByRole('button', { name: 'Copy run ID' })).toHaveAttribute(
      'data-analytics-id',
      'copy-icon-button'
    );
  });
});

describe('CopyButton', () => {
  it.each([{ variant: 'full' as const }, { variant: 'icon' as const }])(
    'forwards data attributes to the $variant button',
    ({ variant }) => {
      lsRender(
        <CopyButton
          copy="run-id"
          copyText="Copy run ID"
          variant={variant}
          data-analytics-id="copy-button"
        />
      );

      expect(
        screen.getByRole('button', { name: 'Copy run ID' })
      ).toHaveAttribute('data-analytics-id', 'copy-button');
    }
  );
});
