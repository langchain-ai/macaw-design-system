import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from '..';

describe('DescriptionList', () => {
  it('preserves semantic grouping, native attributes, refs, and zero values', () => {
    const listRef = createRef<HTMLDListElement>();
    const itemRef = createRef<HTMLDivElement>();
    const termRef = createRef<HTMLElement>();
    const detailRef = createRef<HTMLElement>();

    render(
      <DescriptionList
        ref={listRef}
        aria-label="Run details"
        className="custom-list"
      >
        <DescriptionListItem ref={itemRef}>
          <DescriptionListTerm ref={termRef} id="retries">
            Retries
          </DescriptionListTerm>
          <DescriptionListDetail ref={detailRef} title="No retries">
            {0}
          </DescriptionListDetail>
        </DescriptionListItem>
      </DescriptionList>
    );

    expect(listRef.current?.tagName).toBe('DL');
    expect(listRef.current).toHaveAttribute('aria-label', 'Run details');
    expect(listRef.current).toHaveClass('custom-list');
    expect(itemRef.current?.parentElement).toBe(listRef.current);
    expect(termRef.current?.tagName).toBe('DT');
    expect(termRef.current).toHaveAttribute('id', 'retries');
    expect(detailRef.current?.tagName).toBe('DD');
    expect(detailRef.current?.previousElementSibling).toBe(termRef.current);
    expect(detailRef.current).toHaveTextContent('0');
    expect(detailRef.current).toHaveAttribute('title', 'No retries');
  });

  it('keeps rows out of the tab order while preserving interactive values', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <DescriptionList layout="stacked">
        <DescriptionListItem>
          <DescriptionListTerm>Repository</DescriptionListTerm>
          <DescriptionListDetail>
            <a href="https://github.com/langchain-ai/langgraph">
              View repository
            </a>
            <button type="button" disabled>
              Unavailable action
            </button>
            <button type="button" onClick={onClick}>
              Refresh
            </button>
          </DescriptionListDetail>
        </DescriptionListItem>
      </DescriptionList>
    );

    await user.tab();
    expect(screen.getByRole('link')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });
});
