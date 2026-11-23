import type { ReactNode } from 'react';

import { linkTo } from '@storybook/addon-links';

import { Link } from '../components/Link';
import type { LinkProps } from '../components/Link';

/**
 * Links to another story from a docs page or story. A plain click navigates
 * with `linkTo`. The href is relative to the preview iframe's folder, so
 * opening it in a new tab lands on the Storybook UI, locally and under the
 * Pages subpath.
 */
export function StoryLink({
  title,
  name,
  variant,
  children,
}: {
  title: string;
  name: string;
  variant?: LinkProps['variant'];
  children: ReactNode;
}) {
  return (
    <Link
      href={`./?path=/story/${storyId(title, name)}`}
      target="_top"
      variant={variant}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        linkTo(title, name)();
      }}
    >
      {children}
    </Link>
  );
}

function storyId(title: string, name: string) {
  return `${slug(title)}--${slug(name)}`;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
