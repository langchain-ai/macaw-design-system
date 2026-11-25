import { describe, expect, it } from 'vitest';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { screen } from '@testing-library/react';

import { render as lsRender } from '../../../test-utils';
import { IconButton } from '../../IconButton';
import { Button } from '../Button';

const pressedClassNames = [
  'active:scale-[0.97]',
  'active:brightness-95',
  'motion-reduce:active:scale-100',
];

describe.each([
  {
    name: 'Button',
    render: (disabled: boolean) =>
      lsRender(<Button disabled={disabled}>Save</Button>),
    accessibleName: 'Save',
  },
  {
    name: 'IconButton',
    render: (disabled: boolean) =>
      lsRender(
        <IconButton
          disabled={disabled}
          icon={MagnifyingGlassIcon}
          label="Search"
        />
      ),
    accessibleName: 'Search',
  },
])('$name pressed state', ({ render, accessibleName }) => {
  it('applies the pressed treatment when enabled', () => {
    render(false);

    expect(screen.getByRole('button', { name: accessibleName })).toHaveClass(
      ...pressedClassNames
    );
  });

  it('does not apply the pressed treatment when disabled', () => {
    render(true);

    const button = screen.getByRole('button', { name: accessibleName });
    pressedClassNames.forEach((className) => {
      expect(button).not.toHaveClass(className);
    });
  });
});

describe('Button accessible names', () => {
  it('uses rich content and its badge as the accessible name', () => {
    lsRender(
      <Button tagText="Beta">
        <span>
          Create <strong>project</strong>
        </span>
      </Button>
    );

    expect(
      screen.getByRole('button', { name: /Create project\s*Beta/ })
    ).toBeInTheDocument();
  });

  it('preserves a rich label and announces busy state while loading', () => {
    const { rerender } = lsRender(
      <Button loading>
        <span>Save changes</span>
      </Button>
    );

    expect(
      screen.getByRole('button', { name: 'Save changes' })
    ).toHaveAttribute('aria-busy', 'true');

    rerender(
      <Button>
        <span>Save changes</span>
      </Button>
    );

    expect(
      screen.getByRole('button', { name: 'Save changes' })
    ).not.toHaveAttribute('aria-busy');
  });

  it('preserves explicit labels and external label references while loading', () => {
    lsRender(
      <>
        <Button loading aria-label="Save project">
          <span>Save</span>
        </Button>
        <span id="publish-project">Publish project</span>
        <Button loading aria-labelledby="publish-project">
          <span>Publish</span>
        </Button>
      </>
    );

    expect(
      screen.getByRole('button', { name: 'Save project' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Publish project' })
    ).toBeInTheDocument();
  });

  it('preserves rich link names, explicit names, and hrefs when rendered as a link', () => {
    const { rerender } = lsRender(
      <Button as={<a href="/projects">Projects</a>} loading>
        <span>View projects</span>
      </Button>
    );

    expect(screen.getByRole('link', { name: 'View projects' })).toHaveAttribute(
      'href',
      '/projects'
    );
    expect(screen.getByRole('link', { name: 'View projects' })).toHaveAttribute(
      'aria-busy',
      'true'
    );

    rerender(
      <Button
        as={
          <a href="/projects" aria-label="All projects">
            Projects
          </a>
        }
        loading
      >
        <span>View projects</span>
      </Button>
    );

    expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute(
      'href',
      '/projects'
    );
  });

  it('keeps independent loading labels for multiple rich buttons', () => {
    lsRender(
      <>
        <Button loading>
          <span>Save draft</span>
        </Button>
        <Button loading>
          <span>Publish project</span>
        </Button>
      </>
    );

    expect(
      screen.getByRole('button', { name: 'Save draft' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Publish project' })
    ).toBeInTheDocument();
  });
});

describe('IconButton loading state', () => {
  it('keeps its accessible name and exposes busy state', () => {
    const { rerender } = lsRender(
      <IconButton icon={MagnifyingGlassIcon} label="Search projects" loading />
    );

    expect(
      screen.getByRole('button', { name: 'Search projects' })
    ).toHaveAttribute('aria-busy', 'true');

    rerender(<IconButton icon={MagnifyingGlassIcon} label="Search projects" />);

    expect(
      screen.getByRole('button', { name: 'Search projects' })
    ).not.toHaveAttribute('aria-busy');
  });

  it('preserves a slotted link and its label while loading', () => {
    lsRender(
      <IconButton
        icon={MagnifyingGlassIcon}
        label="Search projects"
        loading
        asChild
      >
        <a href="/projects">Projects</a>
      </IconButton>
    );

    const link = screen.getByRole('link', { name: 'Search projects' });
    expect(link).toHaveAttribute('href', '/projects');
    expect(link).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Slotted busy state', () => {
  it('preserves the Button child state when no loading state is supplied', () => {
    lsRender(
      <Button
        as={
          <a href="/projects" aria-busy="true">
            Projects
          </a>
        }
      >
        View projects
      </Button>
    );

    expect(screen.getByRole('link', { name: 'View projects' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
  });

  it('preserves the IconButton child state when no loading state is supplied', () => {
    lsRender(
      <IconButton icon={MagnifyingGlassIcon} label="Search projects" asChild>
        <a href="/projects" aria-busy="true">
          Projects
        </a>
      </IconButton>
    );

    expect(
      screen.getByRole('link', { name: 'Search projects' })
    ).toHaveAttribute('aria-busy', 'true');
  });
});
