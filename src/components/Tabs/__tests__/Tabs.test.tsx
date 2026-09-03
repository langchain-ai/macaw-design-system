import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { TabGroup, TabLabel, TabList, TabPanel, TabPanels } from '../index';

describe('Tabs Component', () => {
  it('renders badge when badge prop with children is provided', () => {
    render(
      <TabGroup>
        <TabList>
          <TabLabel
            label="Test Tab"
            badgeProps={{
              children: '42',
              color: 'secondary',
              size: 'xs',
            }}
            dataTestId="tab-with-badge"
          />
          <TabLabel label="Tab Without Badge" dataTestId="tab-without-badge" />
        </TabList>
        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
        </TabPanels>
      </TabGroup>
    );

    // Tab with badge should show the badge content
    const tabWithBadge = screen.getByTestId('tab-with-badge');
    expect(tabWithBadge).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Test Tab')).toBeInTheDocument();

    // Tab without badge should not show any badge
    const tabWithoutBadge = screen.getByTestId('tab-without-badge');
    expect(tabWithoutBadge).toBeInTheDocument();
    expect(screen.getByText('Tab Without Badge')).toBeInTheDocument();

    // Verify badge is not present in the tab without badge
    const badges = screen.getAllByText('42');
    expect(badges).toHaveLength(1);
  });
});
