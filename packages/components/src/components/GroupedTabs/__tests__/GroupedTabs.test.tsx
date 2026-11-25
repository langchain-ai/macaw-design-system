import { useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { render, screen } from '../../../test-utils';
import { GroupedTabs } from '../GroupedTabs';

describe('GroupedTabs', () => {
  it('composes with accessible tabs while preserving keyboard activation and disabled options', async () => {
    const { user } = render(
      <TabGroup manual>
        <TabList>
          {({ selectedIndex }) => (
            <GroupedTabs
              buttonComponent={Tab}
              value={selectedIndex}
              onChange={() => {}}
              options={[
                { value: 0, display: 'Overview' },
                { value: 1, display: 'Unavailable', disabled: true },
                { value: 2, display: 'Activity' },
              ]}
            />
          )}
        </TabList>
        <TabPanels>
          <TabPanel>Overview content</TabPanel>
          <TabPanel>Unavailable content</TabPanel>
          <TabPanel>Activity content</TabPanel>
        </TabPanels>
      </TabGroup>
    );
    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    await user.keyboard('{Enter}');
    expect(
      screen.getByRole('tabpanel', { name: 'Activity' })
    ).toHaveTextContent('Activity content');
    expect(screen.getByRole('tab', { name: 'Unavailable' })).toBeDisabled();
    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  });

  it('forwards data attributes to the group, not to each option', () => {
    render(
      <GroupedTabs
        value="table"
        onChange={() => {}}
        options={[
          { value: 'table', display: 'Table' },
          { value: 'chart', display: 'Chart' },
        ]}
        data-testid="view-mode"
      />
    );

    const group = screen.getByTestId('view-mode');
    expect(group).toContainElement(
      screen.getByRole('button', { name: 'Table' })
    );
    expect(group).toContainElement(
      screen.getByRole('button', { name: 'Chart' })
    );
  });

  it('announces the selected view and preserves keyboard activation', async () => {
    function ViewSwitcher() {
      const [value, setValue] = useState('table');
      return (
        <GroupedTabs
          value={value}
          onChange={setValue}
          options={[
            { value: 'table', display: 'Table' },
            { value: 'chart', display: 'Chart' },
          ]}
        />
      );
    }
    const { user } = render(<ViewSwitcher />);

    expect(
      screen.getByRole('button', { name: 'Table', pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Chart', pressed: false })
    ).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Table' })).toHaveFocus();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(
      screen.getByRole('button', { name: 'Chart', pressed: true })
    ).toHaveFocus();
    expect(
      screen.getByRole('button', { name: 'Table', pressed: false })
    ).toBeInTheDocument();

    await user.tab({ shift: true });
    await user.keyboard(' ');

    expect(
      screen.getByRole('button', { name: 'Table', pressed: true })
    ).toHaveFocus();
  });

  it('keeps disabled options unavailable to pointer and keyboard selection', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <GroupedTabs
        value="table"
        onChange={onChange}
        options={[
          { value: 'table', display: 'Table' },
          { value: 'chart', display: 'Chart', disabled: true },
          { value: 'json', display: 'JSON' },
        ]}
      />
    );
    const disabledOption = screen.getByRole('button', {
      name: 'Chart',
      pressed: false,
    });
    expect(disabledOption).toBeDisabled();
    await user.click(disabledOption);
    expect(onChange).not.toHaveBeenCalled();

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'JSON' })).toHaveFocus();
  });
});
