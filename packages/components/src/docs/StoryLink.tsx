import type { ReactNode } from 'react';

import { linkTo } from '@storybook/addon-links';

import { Link } from '../components/Link';
import type { LinkProps } from '../components/Link';

/**
 * Links to another story or docs page. A plain click navigates with `linkTo`.
 * The href is relative to the preview iframe's folder, so opening it in a new
 * tab lands on the Storybook UI, locally and under the Pages subpath.
 */
export function StoryLink({
  title,
  name,
  docs = false,
  variant,
  children,
}: {
  title: string;
  /** The story's display name. Leave it out for a docs page. */
  name?: string;
  docs?: boolean;
  variant?: LinkProps['variant'];
  children: ReactNode;
}) {
  const storyName = docs ? 'Docs' : (name ?? '');
  return (
    <Link
      href={`./?path=/${docs ? 'docs' : 'story'}/${slug(title)}--${slug(storyName)}`}
      target="_top"
      variant={variant}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        linkTo(title, storyName)();
      }}
    >
      {children}
    </Link>
  );
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
