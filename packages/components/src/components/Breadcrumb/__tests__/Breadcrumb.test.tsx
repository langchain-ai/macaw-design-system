import { createRef } from 'react';

import { Link as RouterLink, MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Breadcrumb, BreadcrumbLink, BreadcrumbPage } from '../Breadcrumb';

describe('Breadcrumb', () => {
  it('renders ordered navigation with a noninteractive current page and hidden separators', async () => {
    render(
      <Breadcrumb separator=">">
        <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        {false}
        <BreadcrumbLink href="/projects/support">Support Agent</BreadcrumbLink>
        <BreadcrumbPage>Trace Details</BreadcrumbPage>
      </Breadcrumb>
    );
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(
      screen.getByText('Trace Details').closest('[aria-current]')
    ).toHaveAttribute('aria-current', 'page');
    for (const separator of screen.getAllByText('>'))
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Support Agent' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('composes with router links and forwards refs and anchor attributes', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <MemoryRouter>
        <Breadcrumb aria-label="File path">
          <BreadcrumbLink
            as={<RouterLink to="/files" className="router-link" />}
            ref={ref}
            target="_blank"
            rel="noreferrer"
          >
            Files
          </BreadcrumbLink>
          <BreadcrumbPage>Notes</BreadcrumbPage>
        </Breadcrumb>
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'Files' });
    expect(link).toHaveAttribute('href', '/files');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('router-link');
    expect(ref.current).toBe(link);
    expect(
      screen.getByRole('navigation', { name: 'File path' })
    ).toBeInTheDocument();
  });

  it('keeps full labels available when truncated', () => {
    render(
      <Breadcrumb>
        <BreadcrumbLink href="/projects">A long project name</BreadcrumbLink>
        <BreadcrumbPage>A long trace name</BreadcrumbPage>
      </Breadcrumb>
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'title',
      'A long project name'
    );
    expect(screen.getByTitle('A long trace name')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('renders no navigation for empty items and no separator for a single page', () => {
    const { rerender } = render(<Breadcrumb>{null}</Breadcrumb>);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    rerender(
      <Breadcrumb separator=">">
        <BreadcrumbPage>Projects</BreadcrumbPage>
      </Breadcrumb>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.queryByText('>')).not.toBeInTheDocument();
  });
});
