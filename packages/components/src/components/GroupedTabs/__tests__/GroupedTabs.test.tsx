import { describe, expect, it } from 'vitest';

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
});
