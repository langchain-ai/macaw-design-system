import { describe, expect, it } from 'vitest';

import { screen } from '@testing-library/react';

import { render as lsRender } from '../../../test-utils';
import { CopyIconButton } from '../CopyButton';

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
});
